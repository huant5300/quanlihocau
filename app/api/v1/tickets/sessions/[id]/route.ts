import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const fishingSession = await prisma.fishingSession.findUnique({
      where: { id },
      include: {
        area: true,
        customer: true,
        fishCatches: {
          include: { fishType: true }
        },
        invoices: {
          include: {
            items: true,
            payments: true
          }
        }
      }
    });
    
    if (!fishingSession) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lượt câu" }, { status: 404 });
    }

    return NextResponse.json(fishingSession);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
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

    const updated = await prisma.fishingSession.update({
      where: { id },
      data: body,
      include: {
        area: true,
        customer: true
      }
    });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
