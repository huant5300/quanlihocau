import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { fishTypeId, weight, buybackPrice } = body;

    if (!fishTypeId || !weight) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin loại cá hoặc cân nặng" }, { status: 400 });
    }

    const totalAmount = Number(weight) * Number(buybackPrice || 0);

    const result = await prisma.fishCatch.create({
      data: {
        sessionId: id,
        fishTypeId,
        weight: Number(weight),
        buybackPrice: Number(buybackPrice || 0),
        totalAmount,
        isSoldBack: true,
      },
      include: {
        fishType: true
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
