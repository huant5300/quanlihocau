import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

export async function GET(req: NextRequest) {
  try {
    const session_auth = await auth();
    
    if (!session_auth?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let lakeId = await getActiveLakeId();
    let lake = null;

    if (lakeId) {
      lake = await prisma.fishingLake.findUnique({
        where: { id: lakeId }
      });
    }

    if (!lake && session_auth.user.id) {
      lake = await prisma.fishingLake.findFirst({
        where: { managerId: session_auth.user.id }
      });
    }

    if (!lake && session_auth.user.lakeId) {
      lake = await prisma.fishingLake.findUnique({
        where: { id: session_auth.user.lakeId }
      });
    }

    if (!lake) {
      lake = await prisma.fishingLake.findFirst();
    }

    if (!lake) {
      lake = await prisma.fishingLake.create({
        data: {
          name: session_auth.user.name ? `Hồ câu ${session_auth.user.name}` : "Hồ câu dịch vụ",
          address: "",
          phone: (session_auth.user as any).phone || "",
          managerId: session_auth.user.id,
          totalSpots: 10,
          description: "Chúc quý khách giật được nhiều cá khủng!",
        }
      });
    }

    return NextResponse.json({
      name: lake.name || "",
      address: lake.address || "",
      totalSpots: lake.totalSpots || 10,
      receipt_footer: lake.description || "",
      phone: lake.phone || "",
      bankName: lake.bankName || "",
      bankAccount: lake.bankAccount || "",
      bankHolder: lake.bankHolder || "",
      bankBin: lake.bankBin || "",
    });
  } catch (error: any) {
    console.error("Get Lake Settings Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session_auth = await auth();

    if (!session_auth?.user) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
    }

    let lakeId = await getActiveLakeId();
    let targetLake = null;

    if (lakeId) {
      targetLake = await prisma.fishingLake.findUnique({
        where: { id: lakeId }
      });
    }

    if (!targetLake && session_auth.user.id) {
      targetLake = await prisma.fishingLake.findFirst({
        where: { managerId: session_auth.user.id }
      });
    }

    if (!targetLake && session_auth.user.lakeId) {
      targetLake = await prisma.fishingLake.findUnique({
        where: { id: session_auth.user.lakeId }
      });
    }

    if (!targetLake) {
      targetLake = await prisma.fishingLake.findFirst();
    }

    const body = await req.json();

    // 1. Mandatory fields validation
    const cleanName = body.name?.trim();
    const cleanAddress = body.address?.trim();
    const cleanPhone = body.phone?.trim();

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ success: false, message: "Tên hồ câu là bắt buộc (tối thiểu 2 ký tự)!" }, { status: 400 });
    }

    if (!cleanAddress || cleanAddress.length < 5) {
      return NextResponse.json({ success: false, message: "Địa chỉ hồ câu là bắt buộc (tối thiểu 5 ký tự)!" }, { status: 400 });
    }

    if (!cleanPhone) {
      return NextResponse.json({ success: false, message: "Số điện thoại liên hệ là bắt buộc!" }, { status: 400 });
    }

    const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      return NextResponse.json({ success: false, message: "Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)!" }, { status: 400 });
    }

    // 2. Check for duplicate phone number across other lakes (1 lake/account = 1 unique phone)
    const existingLakeWithPhone = await prisma.fishingLake.findFirst({
      where: {
        phone: cleanPhone,
        ...(targetLake?.id ? { id: { not: targetLake.id } } : {})
      }
    });

    if (existingLakeWithPhone) {
      return NextResponse.json({
        success: false,
        message: `Số điện thoại ${cleanPhone} đã được đăng ký bởi hồ câu khác! Mỗi hồ câu phải sử dụng một số điện thoại duy nhất.`
      }, { status: 400 });
    }

    if (!targetLake) {
      targetLake = await prisma.fishingLake.create({
        data: {
          name: cleanName,
          address: cleanAddress,
          phone: cleanPhone,
          description: body.receipt_footer || body.receiptFooter || "",
          totalSpots: body.totalSpots ? Number(body.totalSpots) : 10,
          bankName: body.bankName || "",
          bankAccount: body.bankAccount || "",
          bankHolder: body.bankHolder || "",
          bankBin: body.bankBin || "",
          managerId: session_auth.user.id || undefined,
        }
      });
    } else {
      targetLake = await prisma.fishingLake.update({
        where: { id: targetLake.id },
        data: {
          name: cleanName,
          address: cleanAddress,
          phone: cleanPhone,
          description: (body.receipt_footer !== undefined ? body.receipt_footer : body.receiptFooter) ?? targetLake.description,
          totalSpots: body.totalSpots ? Number(body.totalSpots) : targetLake.totalSpots,
          bankName: body.bankName !== undefined ? body.bankName : targetLake.bankName,
          bankAccount: body.bankAccount !== undefined ? body.bankAccount : targetLake.bankAccount,
          bankHolder: body.bankHolder !== undefined ? body.bankHolder : targetLake.bankHolder,
          bankBin: body.bankBin !== undefined ? body.bankBin : targetLake.bankBin,
        }
      });
    }

    // Sync manager phone number safely
    if (targetLake.managerId && cleanPhone) {
      try {
        await prisma.user.update({
          where: { id: targetLake.managerId },
          data: { phone: cleanPhone }
        });
      } catch (err) {
        console.warn("Failed to sync manager phone:", err);
      }
    }

    // Record activity log safely
    if (session_auth.user.id) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: session_auth.user.id,
            lakeId: targetLake.id,
            action: "UPDATE_LAKE",
            details: {
              name: cleanName,
              phone: cleanPhone,
              address: cleanAddress
            }
          }
        });
      } catch (err) {
        console.warn("Failed to create activity log:", err);
      }
    }

    // Sync FishingArea records if totalSpots is provided
    if (body.totalSpots) {
      try {
        const total = Number(body.totalSpots);
        const existingAreas = await prisma.fishingArea.findMany({
          where: { lakeId: targetLake.id },
          orderBy: { name: "asc" }
        });

        if (existingAreas.length < total) {
          const toAdd = total - existingAreas.length;
          const areasToCreate = [];
          for (let i = 1; i <= toAdd; i++) {
            areasToCreate.push({
              lakeId: targetLake.id,
              name: `Ô số ${existingAreas.length + i}`,
              hourlyRate: 50000,
              status: "AVAILABLE" as any,
              capacity: 1,
            });
          }

          if (areasToCreate.length > 0) {
            await prisma.fishingArea.createMany({
              data: areasToCreate
            });
          }
        }
      } catch (err) {
        console.warn("Failed to sync fishing areas:", err);
      }
    }

    return NextResponse.json({
      name: targetLake.name,
      address: targetLake.address || "",
      totalSpots: targetLake.totalSpots,
      receipt_footer: targetLake.description || "",
      phone: targetLake.phone || "",
      bankName: targetLake.bankName || "",
      bankAccount: targetLake.bankAccount || "",
      bankHolder: targetLake.bankHolder || "",
      bankBin: targetLake.bankBin || "",
    });
  } catch (error: any) {
    console.error("Update Lake Settings Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi cập nhật hồ câu" }, { status: 500 });
  }
}
