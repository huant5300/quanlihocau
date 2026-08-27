"use server";

import { CustomerRepository } from "@/repositories/customer-repository";
import { revalidatePath } from "next/cache";
import { getActiveLakeId } from "@/lib/lake-context";
import { checkResourceLimit } from "@/utils/saas-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAuth } from "@/lib/auth-guard";
import { CustomerSchema } from "@/lib/validations";

export async function createCustomerAction(data: {
  fullName: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const parseResult = CustomerSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const { fullName, phone, address, notes } = parseResult.data;
    const { lakeId } = authResult.user;

    if (!lakeId) {
      return { success: false, error: "Không tìm thấy hồ câu đang hoạt động" };
    }

    // Check SaaS Resource Limit
    const limitCheck = await checkResourceLimit(lakeId, "customers");
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.message };
    }

    // Check if phone already exists in this lake
    if (phone) {
      const existing = await prisma.customer.findFirst({
        where: {
          lakeId,
          phone,
        },
      });

      if (existing) {
        const updated = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            fullName: fullName || existing.fullName,
            address: data.address || existing.address,
            notes: data.notes || existing.notes,
          },
        });
        revalidatePath("/dashboard/customers");
        revalidatePath("/dashboard/crm");
        return {
          success: true,
          data: {
            ...updated,
            totalSpent: Number(updated.totalSpent),
            debtBalance: Number(updated.debtBalance),
          },
          alreadyExisted: true,
        };
      }
    }

    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone: phone || "",
        address: data.address || undefined,
        notes: data.notes || undefined,
        lakeId,
        visitCount: 0,
        totalSpent: 0,
        debtBalance: 0,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return {
      success: true,
      data: {
        ...customer,
        totalSpent: Number(customer.totalSpent),
        debtBalance: Number(customer.debtBalance),
      },
    };
  } catch (error: any) {
    console.error("createCustomerAction error:", error);
    return { success: false, error: error.message || "Không thể tạo khách hàng" };
  }
}

export async function updateCustomerAction(id: string, data: any) {
  try {
    const customer = await CustomerRepository.update(id, data);
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await CustomerRepository.delete(id);
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomersAction() {
  try {
    const session = await auth();
    if (!session?.user) return { success: true, data: [] };

    const lakeId = (await getActiveLakeId()) || session.user.lakeId;

    if (!lakeId) return { success: true, data: [] };

    const customers = await prisma.customer.findMany({
      where: {
        lakeId,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: customers.map((c: any) => ({
        ...c,
        totalSpent: Number(c.totalSpent || 0),
        debtBalance: Number(c.debtBalance || 0),
      })),
    };
  } catch (error: any) {
    console.error("getCustomersAction error:", error);
    return { success: true, data: [] };
  }
}

export async function getCustomerDetailsAction(id: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { startTime: "desc" },
          include: {
            area: true,
            FishingPackage: true,
            fishCatches: {
              include: { fishType: true },
            },
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          include: {
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      return { success: false, error: "Không tìm thấy khách hàng" };
    }

    // Map Decimal thành Number
    const mappedCustomer = {
      id: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address || "Chưa cập nhật",
      notes: customer.notes || "Không có ghi chú",
      debtBalance: Number(customer.debtBalance),
      totalSpent: Number(customer.totalSpent),
      visitCount: customer.visitCount,
      isVip: customer.isVip,
      createdAt: customer.createdAt.toISOString(),
      sessions: customer.sessions.map((s) => ({
        id: s.id,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime ? s.endTime.toISOString() : null,
        status: s.status,
        areaName: s.area?.name || "N/A",
        hourlyRate: Number(s.hourlyRate),
        totalHours: s.totalHours || 0,
        amount: Number(s.sessionAmount),
        packageName: s.FishingPackage?.name || null,
        prepaidAmount: Number(s.prepaidAmount),
        fishCatchesCount: s.fishCatches.length,
      })),
      invoices: customer.invoices.map((inv) => {
        const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const amount = Number(inv.totalAmount);
        const remainingDebt = Math.max(0, amount - totalPaid);

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          totalAmount: amount,
          totalPaid,
          remainingDebt,
          status: inv.status,
          createdAt: inv.createdAt.toISOString(),
        };
      }),
    };

    return { success: true, data: mappedCustomer };
  } catch (error: any) {
    console.error("Error in getCustomerDetailsAction:", error);
    return { success: false, error: error.message || "Lỗi khi tải chi tiết khách hàng" };
  }
}
