import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

// GET: Lấy danh sách mẻ cá đã thu theo sessionId
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Thiếu sessionId" }, { status: 400 });
    }

    const catches = await prisma.fishCatch.findMany({
      where: { sessionId },
      include: { fishType: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(catches);
  } catch (error: any) {
    console.error("Fish Catches GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Ghi nhận một lần thu mua cá mới
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, fishTypeId, weight, isSoldBack } = body;

    if (!sessionId || !fishTypeId || !weight || weight <= 0) {
      return NextResponse.json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ: phiên câu, loại cá và cân nặng hợp lệ.",
      }, { status: 400 });
    }

    // 1. Verify the session exists and is ACTIVE
    const fishingSession = await prisma.fishingSession.findUnique({
      where: { id: sessionId },
    });

    if (!fishingSession || fishingSession.status !== "ACTIVE") {
      return NextResponse.json({
        success: false,
        message: "Phiên câu không tồn tại hoặc đã kết thúc.",
      }, { status: 400 });
    }

    // 2. Get fish type to determine buyback price
    const fishType = await prisma.fishType.findUnique({
      where: { id: fishTypeId },
    });

    if (!fishType) {
      return NextResponse.json({
        success: false,
        message: "Loại cá không hợp lệ.",
      }, { status: 400 });
    }

    const buybackPrice = Number(fishType.buybackPrice);
    const totalAmount = Math.round(weight * buybackPrice);

    // 3. Create FishCatch record
    const fishCatch = await prisma.fishCatch.create({
      data: {
        sessionId,
        fishTypeId,
        weight,
        buybackPrice,
        totalAmount,
        isSoldBack: isSoldBack !== undefined ? isSoldBack : true,
      },
      include: { fishType: true },
    });

    return NextResponse.json({
      success: true,
      data: fishCatch,
      message: `Đã ghi nhận ${weight}kg ${fishType.name} - Khấu trừ ${totalAmount.toLocaleString()}đ`,
    });
  } catch (error: any) {
    console.error("Fish Catches POST Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
