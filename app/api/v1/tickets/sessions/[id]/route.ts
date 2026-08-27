import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    if (!session && !isSuperAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
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

    // Tenant Isolation Check
    if (fishingSession.lakeId !== lakeId && !isSuperAdmin) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền truy cập lượt câu này" }, { status: 403 });
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
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    if (!session && !isSuperAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    const { id } = await params;
    const body = await req.json();

    // Find existing session to check tenant ownership
    const existingSession = await prisma.fishingSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lượt câu" }, { status: 404 });
    }

    // Tenant Isolation Check
    if (existingSession.lakeId !== lakeId && !isSuperAdmin) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thay đổi lượt câu này" }, { status: 403 });
    }

    // Role-based pricing protection (prevent loss of revenue)
    const customPrice = body.customPrice;
    const customDuration = body.customDuration;
    if ((customPrice !== undefined || customDuration !== undefined) && 
        session?.user?.role !== "OWNER" && 
        !isSuperAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "Bạn không có quyền thiết lập giá tùy chỉnh hoặc thời lượng tùy chỉnh. Chỉ Chủ Hồ mới có quyền này." 
      }, { status: 403 });
    }

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
