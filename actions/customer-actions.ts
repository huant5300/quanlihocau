"use server";

import { CustomerRepository } from "@/repositories/customer-repository";
import { revalidatePath } from "next/cache";
import { getActiveLakeId } from "@/lib/lake-context";
import { checkResourceLimit } from "@/utils/saas-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function createCustomerAction(data: { fullName: string; phone?: string; address?: string; notes?: string }) {
  try {
    let lakeId = await getActiveLakeId();
    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst();
      lakeId = firstLake?.id || "";
    }

    if (lakeId) {
      // Check SaaS Resource Limit
      const limitCheck = await checkResourceLimit(lakeId, "customers");
      if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.message };
      }
    }

    const fullName = (data.fullName || "Khách quen").trim();
    let phone = (data.phone || "").trim();
    if (!phone) {
      phone = `KH_${Date.now().toString().slice(-8)}`;
    }

    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existing = await prisma.customer.findUnique({
      where: { phone: phone }
    });

    if (existing) {
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          fullName: fullName !== "Khách quen" ? fullName : existing.fullName,
          address: data.address || existing.address,
          notes: data.notes || existing.notes,
          lakeId: lakeId || existing.lakeId,
        }
      });
      revalidatePath("/dashboard/customers");
      revalidatePath("/dashboard/crm");
      return { 
        success: true, 
        data: {
          ...updated,
          totalSpent: Number(updated.totalSpent),
          debtBalance: Number(updated.debtBalance)
        }, 
        alreadyExisted: true 
      };
    }

    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        address: data.address || null,
        notes: data.notes || null,
        lakeId: lakeId || null,
        visitCount: 0,
        totalSpent: 0,
        debtBalance: 0,
      }
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return { 
      success: true, 
      data: {
        ...customer,
        totalSpent: Number(customer.totalSpent),
        debtBalance: Number(customer.debtBalance)
      } 
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
    let lakeId = await getActiveLakeId();
    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst();
      lakeId = firstLake?.id || "";
    }
    const customers = await CustomerRepository.getAll(lakeId || "").catch(() => []);
    return { 
      success: true, 
      data: customers.map((c: any) => ({
        ...c,
        totalSpent: Number(c.totalSpent || 0),
        debtBalance: Number(c.debtBalance || 0),
      })) 
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
              include: { fishType: true }
            }
          }
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          include: {
            payments: true
          }
        }
      }
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
      })
    };

    return { success: true, data: mappedCustomer };
  } catch (error: any) {
    console.error("Error in getCustomerDetailsAction:", error);
    return { success: false, error: error.message || "Lỗi khi tải chi tiết khách hàng" };
  }
}
