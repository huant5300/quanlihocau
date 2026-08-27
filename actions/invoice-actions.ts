"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { recordActivityLog } from "@/lib/activity-log";
import { InvoiceStatus, PaymentMethod, UserRole } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guard";

/**
 * Lấy danh sách hóa đơn kèm bộ lọc
 */
export async function getInvoicesAction(filters: {
  query?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) return { success: true, data: [] };

    const whereClause: any = { lakeId };

    // Lọc theo khoảng ngày
    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // Đặt giờ đến 23:59:59 của ngày kết thúc
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    // Lọc theo trạng thái hóa đơn
    if (filters.status && filters.status !== "ALL") {
      whereClause.status = filters.status as InvoiceStatus;
    }

    // Lọc theo tìm kiếm (Mã đơn hoặc Tên khách/SĐT khách)
    if (filters.query) {
      const q = filters.query.trim();
      whereClause.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          },
        },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: true,
        session: {
          include: { area: true },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map Decimal thành Number
    const mappedInvoices = invoices.map((inv) => {
      const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalAmount = Number(inv.totalAmount);
      const remainingDebt = Math.max(0, totalAmount - totalPaid);

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: inv.customer?.fullName || "Khách vãng lai",
        customerPhone: inv.customer?.phone || "",
        startTime: inv.session?.startTime ? inv.session.startTime.toISOString() : null,
        endTime: inv.session?.endTime ? inv.session.endTime.toISOString() : null,
        areaName: inv.session?.area?.name || "Bán lẻ",
        subtotal: Number(inv.subtotal),
        discount: Number(inv.discount),
        tax: Number(inv.tax),
        totalAmount,
        totalPaid,
        remainingDebt,
        status: inv.status,
        createdAt: inv.createdAt.toISOString(),
        paymentMethod: inv.payments?.[0]?.method || "CASH",
      };
    });

    return { success: true, data: mappedInvoices };
  } catch (error: any) {
    console.error("Error in getInvoicesAction:", error);
    return { success: false, error: error.message || "Lỗi khi lấy danh sách hóa đơn" };
  }
}

/**
 * Lấy số liệu thống kê hóa đơn để hiển thị trên top cards
 */
export async function getInvoiceStatsAction(filters: { startDate?: string; endDate?: string }) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return {
        success: true,
        data: { revenue: 0, unpaid: 0, paid: 0, debt: 0 },
      };
    }

    const whereClause: any = { lakeId };

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: { payments: true },
    });

    let totalRevenue = 0; // Doanh thu tổng (các đơn hợp lệ)
    let totalPaid = 0;    // Thực tế đã thu
    let totalDebt = 0;    // Số tiền khách đang nợ
    let draftAmount = 0;  // Số tiền hóa đơn UNPAID (chờ thanh toán / đơn nháp)

    invoices.forEach((inv) => {
      if (inv.status === "VOID") return; // Bỏ qua hóa đơn đã hủy

      const amount = Number(inv.totalAmount);
      const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const debt = Math.max(0, amount - paid);

      totalRevenue += amount;
      totalPaid += paid;
      totalDebt += debt;

      if (inv.status === "UNPAID") {
        draftAmount += amount;
      }
    });

    return {
      success: true,
      data: {
        revenue: totalRevenue,
        unpaid: draftAmount,
        paid: totalPaid,
        debt: totalDebt,
      },
    };
  } catch (error: any) {
    console.error("Error in getInvoiceStatsAction:", error);
    return { success: false, error: error.message || "Lỗi thống kê hóa đơn" };
  }
}

/**
 * Xử lý thu nợ công nợ của hóa đơn
 */
export async function payInvoiceDebtAction(data: {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
}) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) return { success: false, error: authResult.error };

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true, customer: true },
    });

    if (!invoice) return { success: false, error: "Không tìm thấy hóa đơn" };

    // Strict Multi-tenant ownership check to prevent IDOR
    if (invoice.lakeId && invoice.lakeId !== authResult.user.lakeId && authResult.user.role !== UserRole.SUPER_ADMIN) {
      return { success: false, error: "Bạn không có quyền thao tác hóa đơn của hồ câu khác" };
    }

    if (invoice.status === "PAID") return { success: false, error: "Hóa đơn này đã được thanh toán đầy đủ" };

    const totalPaidBefore = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const invoiceTotal = Number(invoice.totalAmount);
    const maxPayable = invoiceTotal - totalPaidBefore;

    if (data.amount <= 0 || data.amount > maxPayable) {
      return { success: false, error: `Số tiền thanh toán không hợp lệ (Tối đa: ${maxPayable.toLocaleString()}đ)` };
    }

    const isFullyPaidNow = totalPaidBefore + data.amount >= invoiceTotal;

    // Cập nhật Database sử dụng transaction
    await prisma.$transaction(async (tx) => {
      // 1. Tạo Payment mới
      await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.paymentMethod,
          note: data.note || "Thu nợ công nợ",
        },
      });

      // 2. Cập nhật trạng thái hóa đơn
      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          status: isFullyPaidNow ? "PAID" : "PARTIAL",
        },
      });

      // 3. Nếu hóa đơn có liên kết khách hàng, cập nhật công nợ (debtBalance) của khách
      if (invoice.customerId) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: {
            debtBalance: {
              decrement: data.amount,
            },
          },
        });
      }

      // 4. Tạo bản ghi Transaction dòng tiền
      await tx.transaction.create({
        data: {
          lakeId: invoice.lakeId || "",
          type: "INCOME",
          amount: data.amount,
          description: `Thu nợ hóa đơn #${invoice.invoiceNumber}`,
          category: "SESSION",
          referenceId: invoice.id,
          paymentMethod: data.paymentMethod,
        },
      });

      // 5. Ghi log hoạt động
      await tx.activityLog.create({
        data: {
          userId: authResult.user.userId,
          lakeId: invoice.lakeId,
          action: "PAYMENT",
          details: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: data.amount,
            method: data.paymentMethod,
            isFullyPaid: isFullyPaidNow,
          },
        },
      });

      // 6. Ghi AuditLog kiểm toán đối soát công nợ
      if ((tx as any).auditLog) {
        await (tx as any).auditLog.create({
          data: {
            userId: authResult.user.userId,
            lakeId: invoice.lakeId,
            action: "DEBT_ADJUSTMENT",
            details: {
              invoiceId: invoice.id,
              customerId: invoice.customerId,
              amount: data.amount,
              note: data.note || "Thu nợ công nợ",
            },
          },
        });
      }
    });

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/customers");
    if (invoice.customerId) {
      revalidatePath(`/dashboard/customers/${invoice.customerId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in payInvoiceDebtAction:", error);
    return { success: false, error: error.message || "Lỗi khi xử lý thanh toán nợ" };
  }
}
