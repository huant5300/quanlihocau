import prisma from "@/lib/prisma";

export type SubscriptionPlan = "FREE" | "SILVER" | "GOLD" | "TRIAL";

export interface PlanLimits {
  name: string;
  pricePerMonth: number;
  maxLakes: number;     // Số hồ câu tối đa
  maxHuts: number;      // Số chòi (FishingArea) tối đa
  maxStaff: number;     // Số nhân viên tối đa
  maxCustomers: number; // Số khách hàng tối đa
  offlineMode: boolean; // Có hỗ trợ offline sync không
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    name: "Gói Dùng Thử (TRIAL)",
    pricePerMonth: 0,
    maxLakes: 1,
    maxHuts: 10,
    maxStaff: 2,
    maxCustomers: 100,
    offlineMode: false,
  },
  TRIAL: {
    name: "Gói Dùng Thử (TRIAL)",
    pricePerMonth: 0,
    maxLakes: 1,
    maxHuts: 10,
    maxStaff: 2,
    maxCustomers: 100,
    offlineMode: false,
  },
  SILVER: {
    name: "Gói Bạc (SILVER)",
    pricePerMonth: 99000,
    maxLakes: 1,
    maxHuts: 50,
    maxStaff: 5,
    maxCustomers: 999999,
    offlineMode: true,
  },
  GOLD: {
    name: "Gói Vàng (GOLD)",
    pricePerMonth: 199000,
    maxLakes: 5,
    maxHuts: 999999,
    maxStaff: 20,
    maxCustomers: 999999,
    offlineMode: true,
  },
};

/**
 * Lấy chi tiết gói dịch vụ và tình trạng gia hạn của một hồ câu
 */
export async function getLakeSubscription(lakeId: string) {
  try {
    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!lake) {
      return {
        plan: "FREE" as SubscriptionPlan,
        status: "ACTIVE",
        expiresAt: null,
        isExpired: false,
        limits: PLAN_LIMITS.FREE,
      };
    }

    const plan = (lake.subscriptionPlan || "FREE") as SubscriptionPlan;
    const status = lake.subscriptionStatus || "ACTIVE";
    const expiresAt = lake.subscriptionExpiresAt;

    let isExpired = false;
    if (status === "EXPIRED") {
      isExpired = true;
    } else if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      isExpired = true;
    }

    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

    return {
      plan,
      status,
      expiresAt,
      isExpired,
      limits,
    };
  } catch (error) {
    console.error("Error in getLakeSubscription:", error);
    return {
      plan: "FREE" as SubscriptionPlan,
      status: "ACTIVE",
      expiresAt: null,
      isExpired: false,
      limits: PLAN_LIMITS.FREE,
    };
  }
}

/**
 * Helper kiểm tra nhanh xem hồ câu có bị chặn hoạt động do hết hạn không
 */
export async function checkSubscriptionActive(lakeId: string): Promise<{ active: boolean; reason?: string }> {
  const sub = await getLakeSubscription(lakeId);
  if (sub.isExpired) {
    return {
      active: false,
      reason: `Gói dịch vụ ${PLAN_LIMITS[sub.plan].name} đã hết hạn sử dụng từ ngày ${
        sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("vi-VN") : "chưa xác định"
      }. Vui lòng nâng cấp/gia hạn gói cước để tiếp tục.`,
    };
  }
  return { active: true };
}

/**
 * Kiểm tra giới hạn tài nguyên trước khi thêm mới
 */
export async function checkResourceLimit(
  lakeId: string,
  resourceType: "huts" | "staff" | "customers"
): Promise<{ allowed: boolean; current: number; max: number; message?: string }> {
  const sub = await getLakeSubscription(lakeId);
  
  // Nếu gói đã hết hạn, không cho phép tạo thêm bất cứ thứ gì
  if (sub.isExpired) {
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: "Gói dịch vụ đã hết hạn. Vui lòng thanh toán gia hạn để thực hiện thao tác này.",
    };
  }

  const limits = sub.limits;
  let currentCount = 0;
  let maxLimit = 0;
  let resourceName = "";

  if (resourceType === "huts") {
    currentCount = await prisma.fishingArea.count({ where: { lakeId } });
    maxLimit = limits.maxHuts;
    resourceName = "chòi/vị trí câu";
  } else if (resourceType === "staff") {
    currentCount = await prisma.user.count({
      where: {
        lakeId,
        role: { in: ["STAFF", "CASHIER", "MANAGER"] },
      },
    });
    maxLimit = limits.maxStaff;
    resourceName = "nhân viên";
  } else if (resourceType === "customers") {
    currentCount = await prisma.customer.count({ where: { lakeId } });
    maxLimit = limits.maxCustomers;
    resourceName = "khách hàng";
  }

  if (currentCount >= maxLimit) {
    return {
      allowed: false,
      current: currentCount,
      max: maxLimit,
      message: `Giới hạn của gói hiện tại (${limits.name}) chỉ cho phép tối đa ${maxLimit} ${resourceName}. Bạn đã sử dụng ${currentCount}/${maxLimit}. Vui lòng nâng cấp gói cước để tiếp tục mở rộng.`,
    };
  }

  return {
    allowed: true,
    current: currentCount,
    max: maxLimit,
  };
}
