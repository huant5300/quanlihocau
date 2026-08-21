import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Webhook tự động nhận thông báo biến động số dư ngân hàng (SePay / Casso / Bank IPN)
 * Khi khách chuyển khoản:
 * - 99.000đ (hoặc cú pháp HOCAU <MÃ HỒ> SILVER) -> Tự động kích hoạt GÓI BẠC (+30 ngày)
 * - 199.000đ (hoặc cú pháp HOCAU <MÃ HỒ> GOLD) -> Tự động kích hoạt GÓI VÀNG (+30 ngày, tối đa 5 hồ)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[BANK_WEBHOOK_RECEIVED]", JSON.stringify(body));

    // Hỗ trợ cấu trúc đa dạng của SePay, Casso, PayOS, Napas IPN
    const amount = Number(
      body.transferAmount ||
      body.amount ||
      body.amountIn ||
      body.creditAmount ||
      0
    );

    const description = (
      body.content ||
      body.description ||
      body.orderCode ||
      body.transactionContent ||
      body.addInfo ||
      ""
    ).toUpperCase();

    // 1. Phân tích nội dung chuyển khoản tìm mã hồ câu (Ví dụ: "HOCAU A1B2C3 SILVER" hoặc "HOCAU A1B2C3")
    const match = description.match(/HOCAU\s*([A-Z0-9]+)/i);
    const lakeCode = match ? match[1].trim() : null;

    // 2. Xác định gói cước cần kích hoạt
    let targetPlan: "SILVER" | "GOLD" | null = null;
    if (description.includes("GOLD") || amount >= 199000) {
      targetPlan = "GOLD";
    } else if (description.includes("SILVER") || amount >= 99000) {
      targetPlan = "SILVER";
    }

    if (!targetPlan) {
      return NextResponse.json({ 
        success: false, 
        message: "Số tiền hoặc nội dung không khớp gói cước (99k hoặc 199k)" 
      }, { status: 200 });
    }

    // 3. Tìm hồ câu trong database
    let targetLake = null;
    if (lakeCode) {
      // Tìm theo đuôi ID (6 ký tự) hoặc ID đầy đủ
      const allLakes = await prisma.fishingLake.findMany({
        select: { id: true, name: true, managerId: true, subscriptionExpiresAt: true }
      });
      targetLake = allLakes.find(l => 
        l.id.toUpperCase() === lakeCode || 
        l.id.slice(-6).toUpperCase() === lakeCode
      );
    }

    // Nếu không tìm thấy bằng code, thử tìm theo description chứa id
    if (!targetLake) {
      const allLakes = await prisma.fishingLake.findMany({
        select: { id: true, name: true, managerId: true, subscriptionExpiresAt: true }
      });
      targetLake = allLakes.find(l => description.includes(l.id.slice(-6).toUpperCase()));
    }

    if (!targetLake) {
      console.warn(`[BANK_WEBHOOK] Không tìm thấy hồ câu khớp với mã: ${lakeCode || description}`);
      return NextResponse.json({ 
        success: true, 
        message: "Đã nhận webhook nhưng không tìm thấy hồ câu tương ứng để tự động gán." 
      });
    }

    // 4. Tính toán thời hạn gia hạn (+30 ngày)
    const now = new Date();
    let newExpiresAt = new Date();

    if (targetLake.subscriptionExpiresAt && new Date(targetLake.subscriptionExpiresAt) > now) {
      // Nếu gói vẫn còn hạn, cộng dồn tiếp 30 ngày từ ngày hết hạn hiện tại
      newExpiresAt = new Date(targetLake.subscriptionExpiresAt);
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    } else {
      // Nếu đã hết hạn hoặc đang dùng thử, tính 30 ngày từ thời điểm hiện tại
      newExpiresAt.setDate(now.getDate() + 30);
    }

    // 5. Cập nhật hồ câu
    const updatedLake = await prisma.fishingLake.update({
      where: { id: targetLake.id },
      data: {
        subscriptionPlan: targetPlan,
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: newExpiresAt,
      },
    });

    // 6. Ghi nhận nhật ký hoạt động
    if (targetLake.managerId) {
      await prisma.activityLog.create({
        data: {
          userId: targetLake.managerId,
          lakeId: targetLake.id,
          action: "PAYMENT_UPGRADE",
          details: {
            plan: targetPlan,
            amount: amount,
            durationDays: 30,
            expiresAt: newExpiresAt.toISOString(),
            method: "AUTO_BANK_TRANSFER",
            description: description,
          },
        },
      });
    }

    console.log(`[BANK_WEBHOOK SUCCESS] Đã tự động kích hoạt gói ${targetPlan} cho hồ: ${targetLake.name} (${targetLake.id}) đến ngày ${newExpiresAt.toLocaleDateString("vi-VN")}`);

    return NextResponse.json({
      success: true,
      message: `Tự động kích hoạt thành công gói ${targetPlan}`,
      lakeId: updatedLake.id,
      plan: targetPlan,
      expiresAt: newExpiresAt,
    });

  } catch (error: any) {
    console.error("[BANK_WEBHOOK ERROR]", error);
    return NextResponse.json({ error: error.message || "Lỗi xử lý webhook" }, { status: 500 });
  }
}
