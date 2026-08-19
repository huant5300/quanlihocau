"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Tỉ lệ quy đổi điểm (Mặc định theo yêu cầu: 20.000đ = 1 điểm)
 */
const POINT_CONVERSION_RATE = 20000;

export async function earnPointsAction(customerId: string, invoiceId: string, totalAmount: number) {
  try {
    const pointsToEarn = Math.floor(totalAmount / POINT_CONVERSION_RATE);
    
    if (pointsToEarn <= 0) return { success: true, data: null };

    // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lưu lịch sử
      const history = await tx.pointHistory.create({
        data: {
          customerId,
          points: pointsToEarn,
          type: "EARN",
          description: `Tích điểm từ hóa đơn`,
          referenceId: invoiceId,
        }
      });

      // 2. Cập nhật Customer
      const customer = await tx.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { increment: pointsToEarn },
          totalPoints: { increment: pointsToEarn },
        }
      });

      // 3. Cập nhật hạng thành viên (tùy chọn theo tổng điểm)
      let newTier = customer.loyaltyTier;
      if (customer.totalPoints >= 100) newTier = "DIAMOND";
      else if (customer.totalPoints >= 50) newTier = "GOLD";
      else if (customer.totalPoints >= 20) newTier = "SILVER";
      
      if (newTier !== customer.loyaltyTier) {
        await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyTier: newTier }
        });
      }

      return history;
    });

    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error) {
    console.error("Earn points error:", error);
    return { success: false, error: "Lỗi khi tích điểm" };
  }
}

export async function redeemPointsAction(customerId: string, pointsToRedeem: number, description: string) {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { success: false, error: "Không tìm thấy khách hàng" };
    if (customer.loyaltyPoints < pointsToRedeem) {
      return { success: false, error: "Không đủ điểm để đổi" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const history = await tx.pointHistory.create({
        data: {
          customerId,
          points: -pointsToRedeem,
          type: "REDEEM",
          description,
        }
      });

      await tx.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { decrement: pointsToRedeem }
        }
      });

      return history;
    });

    revalidatePath("/dashboard/customers");
    return { success: true, data: result };
  } catch (error) {
    console.error("Redeem points error:", error);
    return { success: false, error: "Lỗi khi đổi điểm" };
  }
}

export async function getCustomerPointHistoryAction(customerId: string) {
  try {
    const history = await prisma.pointHistory.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return { success: true, data: history };
  } catch (error) {
    return { success: false, error: "Lỗi khi lấy lịch sử điểm" };
  }
}
