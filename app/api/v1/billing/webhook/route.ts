import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Webhook tự động nhận thông báo biến động số dư ngân hàng (SePay / Casso / Bank IPN)
 * Khi khách chuyển khoản qua VietQR:
 * - Cú pháp: HOCAU <MÃ_HỒ> <GÓI> (VD: HOCAU 1A2B3C SILVER hoặc HOCAU 1A2B3C GOLD)
 * - Tự động kích hoạt gói cước ngay lập tức 24/7 và cập nhật Database Realtime.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[BANK_WEBHOOK_RECEIVED]", JSON.stringify(body));

    // Hỗ trợ cấu trúc đa dạng của SePay, Casso, PayOS, Napas, MB, Vietin, BIDV IPN
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

    // 1. Phân tích nội dung chuyển khoản
    // Tìm cú pháp: HOCAU <MÃ_HỒ> hoặc FISHING_SAAS_SUB_<ORDER_ID>
    const hocauMatch = description.match(/HOCAU\s*([A-Z0-9]+)/i);
    const lakeCode = hocauMatch ? hocauMatch[1].trim().toUpperCase() : null;

    const orderMatch = description.match(/FISHING_SAAS_SUB_([A-Z0-9]+)/i);
    const orderIdCode = orderMatch ? orderMatch[1].trim() : null;

    // 2. Xác định gói cước và số tháng dựa trên số tiền hoặc nội dung
    let targetPlan: "SILVER" | "GOLD" = "SILVER";
    let durationMonths = 1;
    let bonusMonths = 0;

    if (description.includes("GOLD") || amount >= 199000) {
      targetPlan = "GOLD";
      if (amount >= 2388000) {
        durationMonths = 12;
        bonusMonths = 3; // 15 tháng
      } else if (amount >= 1194000) {
        durationMonths = 6;
        bonusMonths = 1; // 7 tháng
      } else {
        durationMonths = 1;
        bonusMonths = 0;
      }
    } else {
      targetPlan = "SILVER";
      if (amount >= 1188000) {
        durationMonths = 12;
        bonusMonths = 3; // 15 tháng
      } else if (amount >= 594000) {
        durationMonths = 6;
        bonusMonths = 1; // 7 tháng
      } else {
        durationMonths = 1;
        bonusMonths = 0;
      }
    }

    const totalActiveMonths = durationMonths + bonusMonths;

    // 3. Tìm hồ câu và đơn hàng trong database
    let targetLake = null;
    let targetOrder = null;

    if (orderIdCode) {
      targetOrder = await prisma.subscriptionOrder.findFirst({
        where: { id: { contains: orderIdCode } },
        include: { lake: true },
      });
      if (targetOrder?.lake) {
        targetLake = targetOrder.lake;
      }
    }

    if (!targetLake && lakeCode) {
      // Tìm theo đuôi ID (6 ký tự) hoặc ID đầy đủ
      const allLakes = await prisma.fishingLake.findMany({
        select: { id: true, name: true, managerId: true, subscriptionExpiresAt: true },
      });
      targetLake = allLakes.find(l => 
        l.id.toUpperCase() === lakeCode || 
        l.id.slice(-6).toUpperCase() === lakeCode
      );
    }

    // Nếu vẫn chưa tìm thấy, tìm trong description xem có chứa lake ID không
    if (!targetLake) {
      const allLakes = await prisma.fishingLake.findMany({
        select: { id: true, name: true, managerId: true, subscriptionExpiresAt: true },
      });
      targetLake = allLakes.find(l => description.includes(l.id.slice(-6).toUpperCase()));
    }

    if (!targetLake) {
      console.warn(`[BANK_WEBHOOK] Không tìm thấy hồ câu khớp với mã: ${lakeCode || description}`);
      return NextResponse.json({ 
        success: true, 
        message: "Webhook đã nhận nhưng không tìm thấy hồ câu tương ứng." 
      });
    }

    // 4. Tính toán thời hạn gia hạn (+ totalActiveMonths)
    const now = new Date();
    let newExpiresAt = new Date();

    if (targetLake.subscriptionExpiresAt && new Date(targetLake.subscriptionExpiresAt) > now) {
      // Nếu gói vẫn còn hạn, cộng dồn tiếp
      newExpiresAt = new Date(targetLake.subscriptionExpiresAt);
      newExpiresAt.setMonth(newExpiresAt.getMonth() + totalActiveMonths);
    } else {
      // Nếu đã hết hạn hoặc dùng thử, tính từ hôm nay
      newExpiresAt.setMonth(now.getMonth() + totalActiveMonths);
    }

    // 5. Cập nhật database trong Transaction
    const updatedLake = await prisma.$transaction(async (tx) => {
      const lake = await tx.fishingLake.update({
        where: { id: targetLake.id },
        data: {
          subscriptionPlan: targetPlan,
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: newExpiresAt,
        },
      });

      if (targetOrder) {
        await tx.subscriptionOrder.update({
          where: { id: targetOrder.id },
          data: { status: "APPROVED" },
        });
      } else {
        await tx.subscriptionOrder.create({
          data: {
            lakeId: targetLake.id,
            plan: targetPlan,
            durationMonths: durationMonths,
            amount: amount || (targetPlan === "GOLD" ? 199000 : 99000),
            status: "APPROVED",
            paymentMethod: "AUTO_BANK_WEBHOOK",
            notes: `Tự động duyệt qua Webhook ngân hàng: ${description}`,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: targetLake.managerId || "SYSTEM",
          lakeId: targetLake.id,
          action: "AUTO_PAYMENT_UPGRADE",
          details: {
            plan: targetPlan,
            amount: amount,
            durationMonths: durationMonths,
            bonusMonths: bonusMonths,
            totalMonths: totalActiveMonths,
            expiresAt: newExpiresAt.toISOString(),
            method: "AUTO_BANK_TRANSFER",
            description: description,
          },
        },
      });

      return lake;
    });

    console.log(`[BANK_WEBHOOK SUCCESS] Đã tự động kích hoạt thành công gói ${targetPlan} (+${totalActiveMonths} tháng) cho hồ: ${targetLake.name} (${targetLake.id}) đến ngày ${newExpiresAt.toLocaleDateString("vi-VN")}`);

    return NextResponse.json({
      success: true,
      message: `Tự động kích hoạt thành công gói ${targetPlan} (+${totalActiveMonths} tháng)`,
      lakeId: updatedLake.id,
      plan: targetPlan,
      expiresAt: newExpiresAt.toISOString(),
    });

  } catch (error: any) {
    console.error("[BANK_WEBHOOK ERROR]", error);
    return NextResponse.json({ error: error.message || "Lỗi xử lý webhook" }, { status: 500 });
  }
}
