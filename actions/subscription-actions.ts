"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { recordActivityLog } from "@/lib/activity-log";
import { PLAN_LIMITS, SubscriptionPlan, getLakeSubscription } from "@/utils/saas-helpers";
import { UserRole } from "@prisma/client";

/**
 * Lấy thông tin chi tiết về gói cước và thực tế sử dụng tài nguyên của hồ
 */
export async function getLakeSubscriptionDetails() {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return { success: false, error: "Không tìm thấy hồ câu đang hoạt động" };
    }

    const sub = await getLakeSubscription(lakeId);

    // Thống kê tài nguyên thực tế
    const currentHuts = await prisma.fishingArea.count({ where: { lakeId } });
    const currentStaff = await prisma.user.count({
      where: {
        lakeId,
        role: { in: [UserRole.STAFF, UserRole.CASHIER, UserRole.MANAGER] },
      },
    });
    const currentCustomers = await prisma.customer.count({ where: { lakeId } });

    return {
      success: true,
      data: {
        plan: sub.plan,
        status: sub.status,
        expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : null,
        isExpired: sub.isExpired,
        limits: sub.limits,
        usage: {
          huts: currentHuts,
          staff: currentStaff,
          customers: currentCustomers,
        },
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy thông tin gói cước" };
  }
}

/**
 * Chủ hồ tạo yêu cầu nâng cấp gói cước
 */
export async function createSubscriptionOrder(data: { plan: string; durationMonths: number }) {
  const session = await auth();
  if (!session || session.user.role !== UserRole.OWNER) {
    return { success: false, error: "Chỉ chủ hồ mới có thể tạo yêu cầu nâng cấp gói cext" };
  }

  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return { success: false, error: "Không tìm thấy hồ câu đang hoạt động" };
    }

    const selectedPlan = data.plan as SubscriptionPlan;
    const limits = PLAN_LIMITS[selectedPlan];
    if (!limits || selectedPlan === "FREE") {
      return { success: false, error: "Gói dịch vụ không hợp lệ" };
    }

    const pricePerMonth = limits.pricePerMonth;
    const totalAmount = pricePerMonth * data.durationMonths;

    const order = await prisma.subscriptionOrder.create({
      data: {
        lakeId,
        plan: selectedPlan,
        durationMonths: data.durationMonths,
        amount: totalAmount,
        status: "PENDING",
      },
    });

    await recordActivityLog(session.user.id, "CREATE_SUBSCRIPTION_ORDER", {
      orderId: order.id,
      plan: selectedPlan,
      durationMonths: data.durationMonths,
      amount: totalAmount,
    });

    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi tạo yêu cầu nâng cấp" };
  }
}

/**
 * Lấy lịch sử yêu cầu nâng cấp gói của hồ câu hiện tại
 */
export async function getMySubscriptionOrders() {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) return { success: true, data: [] };

    const orders = await prisma.subscriptionOrder.findMany({
      where: { lakeId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: orders.map((o: any) => ({
        ...o,
        amount: Number(o.amount),
        createdAt: o.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy lịch sử nâng cấp" };
  }
}

/**
 * Super Admin: Lấy toàn bộ đơn hàng đang chờ duyệt
 */
export async function getAllPendingOrders() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.email === "huant5300@gmail.com";
  if (!session || !isSuperAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const orders = await prisma.subscriptionOrder.findMany({
      where: { status: "PENDING" },
      include: {
        lake: {
          select: {
            name: true,
            manager: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: orders.map((o: any) => ({
        ...o,
        amount: Number(o.amount),
        createdAt: o.createdAt.toISOString(),
        lakeName: o.lake?.name || "Hồ không xác định",
        ownerName: o.lake?.manager?.name || "Không rõ",
        ownerEmail: o.lake?.manager?.email || "",
        ownerPhone: o.lake?.manager?.phone || "",
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi lấy danh sách yêu cầu" };
  }
}

/**
 * Super Admin: Phê duyệt đơn nâng cấp gói cước
 */
export async function approveSubscriptionOrder(orderId: string) {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.email === "huant5300@gmail.com";
  if (!session || !isSuperAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await prisma.subscriptionOrder.findUnique({
      where: { id: orderId },
      include: { lake: true },
    });

    if (!order) {
      return { success: false, error: "Không tìm thấy yêu cầu nâng cấp" };
    }

    if (order.status !== "PENDING") {
      return { success: false, error: "Yêu cầu này đã được xử lý từ trước" };
    }

    // Tính toán thời hạn gói cước mới (Ưu đãi: Đăng ký 1 năm tặng 3 tháng = 15 tháng, 6 tháng tặng 1 tháng = 7 tháng)
    const currentExpires = order.lake.subscriptionExpiresAt;
    let baseDate = new Date();
    
    // Nếu gói cũ vẫn còn hạn, tính tiếp nối
    if (currentExpires && new Date(currentExpires).getTime() > Date.now()) {
      baseDate = new Date(currentExpires);
    }

    let bonusMonths = 0;
    if (order.durationMonths === 12) {
      bonusMonths = 3;
    } else if (order.durationMonths === 6) {
      bonusMonths = 1;
    }

    const totalActiveMonths = order.durationMonths + bonusMonths;
    const expiresAtNew = new Date(baseDate);
    expiresAtNew.setMonth(expiresAtNew.getMonth() + totalActiveMonths);

    // Cập nhật database trong Transaction
    await prisma.$transaction([
      prisma.subscriptionOrder.update({
        where: { id: orderId },
        data: { status: "APPROVED" },
      }),
      prisma.fishingLake.update({
        where: { id: order.lakeId },
        data: {
          subscriptionPlan: order.plan,
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: expiresAtNew,
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: session.user.id,
          lakeId: order.lakeId,
          action: "APPROVE_SUBSCRIPTION",
          details: {
            orderId,
            plan: order.plan,
            durationMonths: order.durationMonths,
            amount: Number(order.amount),
            expiresAtNew: expiresAtNew.toISOString(),
          },
        },
      }),
    ]);

    revalidatePath("/dashboard/owners");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi phê duyệt giao dịch" };
  }
}

/**
 * Super Admin: Từ chối đơn nâng cấp gói cước
 */
export async function rejectSubscriptionOrder(orderId: string, notes?: string) {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.email === "huant5300@gmail.com";
  if (!session || !isSuperAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await prisma.subscriptionOrder.update({
      where: { id: orderId },
      data: {
        status: "REJECTED",
        notes: notes || "Admin từ chối thanh toán (không khớp giao dịch chuyển khoản)",
      },
    });

    await recordActivityLog(session.user.id, "REJECT_SUBSCRIPTION", {
      orderId,
      notes,
      lakeId: order.lakeId,
    });

    revalidatePath("/dashboard/owners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi từ chối giao dịch" };
  }
}

/**
 * Super Admin: Thay đổi trực tiếp gói cước của một hồ câu (không qua order)
 */
export async function updateLakeSubscriptionDirect(data: {
  lakeId: string;
  plan: string;
  expiresAt: string | null;
  status: string;
}) {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.email === "huant5300@gmail.com";
  if (!session || !isSuperAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const expiresAtDate = data.expiresAt ? new Date(data.expiresAt) : null;

    await prisma.fishingLake.update({
      where: { id: data.lakeId },
      data: {
        subscriptionPlan: data.plan,
        subscriptionStatus: data.status,
        subscriptionExpiresAt: expiresAtDate,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        lakeId: data.lakeId,
        action: "UPDATE_SUBSCRIPTION_DIRECT",
        details: {
          plan: data.plan,
          status: data.status,
          expiresAt: data.expiresAt,
        },
      },
    });

    revalidatePath("/dashboard/owners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi cập nhật gói trực tiếp" };
  }
}
