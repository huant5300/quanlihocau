import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

/**
 * Realtime Endpoint kiểm tra trạng thái thanh toán & kích hoạt gói cước
 * Frontend gọi liên tục mỗi 2-3s khi đang hiển thị mã QR VietQR
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    let lakeId = searchParams.get("lakeId") || await getActiveLakeId();

    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst();
      lakeId = firstLake?.id || "";
    }

    if (!lakeId) {
      return NextResponse.json({ error: "Không tìm thấy hồ" }, { status: 404 });
    }

    // 1. Kiểm tra trạng thái hồ câu
    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!lake) {
      return NextResponse.json({ error: "Hồ câu không tồn tại" }, { status: 404 });
    }

    // 2. Nếu có orderId, kiểm tra trạng thái đơn hàng cụ thể
    let orderStatus = null;
    let orderPlan = null;
    if (orderId) {
      const order = await prisma.subscriptionOrder.findUnique({
        where: { id: orderId },
        select: { status: true, plan: true, updatedAt: true },
      });
      if (order) {
        orderStatus = order.status;
        orderPlan = order.plan;
      }
    }

    // Tính số ngày còn lại
    let daysRemaining = 0;
    let isExpired = false;
    if (lake.subscriptionExpiresAt) {
      const now = new Date();
      const diffMs = new Date(lake.subscriptionExpiresAt).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isExpired = diffMs <= 0;
    }

    const isActivated = 
      orderStatus === "APPROVED" || 
      (lake.subscriptionPlan !== "TRIAL" && lake.subscriptionPlan !== "FREE" && !isExpired);

    return NextResponse.json({
      success: true,
      isActivated,
      orderStatus,
      lake: {
        id: lake.id,
        name: lake.name,
        plan: lake.subscriptionPlan,
        status: lake.subscriptionStatus,
        expiresAt: lake.subscriptionExpiresAt ? lake.subscriptionExpiresAt.toISOString() : null,
      },
      daysRemaining,
      isExpired,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Check Status Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi kiểm tra trạng thái" }, { status: 500 });
  }
}
