import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

export async function GET(req: NextRequest) {
  try {
    const session_auth = await auth();
    
    if (!session_auth?.user) {
      return NextResponse.json({
        name: "Hồ câu dịch vụ",
        address: "",
        totalSpots: 10,
        receipt_footer: "",
        phone: "",
        bankName: "",
        bankAccount: "",
        bankHolder: "",
        bankBin: "",
      }, { status: 200 });
    }

    let lakeId = await getActiveLakeId();
    let lake = null;

    if (lakeId) {
      lake = await prisma.fishingLake.findUnique({
        where: { id: lakeId }
      }).catch(() => null);
    }

    if (!lake && session_auth.user.id) {
      lake = await prisma.fishingLake.findFirst({
        where: { managerId: session_auth.user.id }
      }).catch(() => null);
    }

    if (!lake && session_auth.user.lakeId) {
      lake = await prisma.fishingLake.findUnique({
        where: { id: session_auth.user.lakeId }
      }).catch(() => null);
    }

    if (!lake) {
      lake = await prisma.fishingLake.findFirst().catch(() => null);
    }

    if (!lake && session_auth.user.id) {
      lake = await prisma.fishingLake.create({
        data: {
          name: session_auth.user.name ? `Hồ câu ${session_auth.user.name}` : "Hồ câu dịch vụ",
          address: "",
          phone: (session_auth.user as any).phone || "",
          managerId: session_auth.user.id,
          totalSpots: 10,
          description: "Chúc quý khách giật được nhiều cá khủng!",
        }
      }).catch(() => null);
    }

    return NextResponse.json({
      name: lake?.name || "Hồ câu dịch vụ",
      address: lake?.address || "",
      totalSpots: lake?.totalSpots || 10,
      receipt_footer: lake?.description || "",
      phone: lake?.phone || "",
      bankName: lake?.bankName || "",
      bankAccount: lake?.bankAccount || "",
      bankHolder: lake?.bankHolder || "",
      bankBin: lake?.bankBin || "",
    }, { status: 200 });
  } catch (error: any) {
    console.error("[Get Lake Settings Fallback]:", error.message);
    return NextResponse.json({
      name: "Hồ câu dịch vụ",
      address: "",
      totalSpots: 10,
      receipt_footer: "",
      phone: "",
      bankName: "",
      bankAccount: "",
      bankHolder: "",
      bankBin: "",
    }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session_auth = await auth();

    if (!session_auth?.user) {
      return NextResponse.json({ success: false, message: "Bạn cần đăng nhập để thực hiện hành động này" }, { status: 401 });
    }

    let lakeId = await getActiveLakeId();
    let targetLake = null;

    if (lakeId) {
      targetLake = await prisma.fishingLake.findUnique({
        where: { id: lakeId }
      }).catch(() => null);
    }

    if (!targetLake && session_auth.user.id) {
      targetLake = await prisma.fishingLake.findFirst({
        where: { managerId: session_auth.user.id }
      }).catch(() => null);
    }

    if (!targetLake && session_auth.user.lakeId) {
      targetLake = await prisma.fishingLake.findUnique({
        where: { id: session_auth.user.lakeId }
      }).catch(() => null);
    }

    if (!targetLake) {
      targetLake = await prisma.fishingLake.findFirst().catch(() => null);
    }

    const body = await req.json();

    // 1. Validation with flexible fallback
    const cleanName = (body.name || "").trim() || "Hồ câu dịch vụ";
    const cleanAddress = (body.address || "").trim() || "Chưa cập nhật";
    const cleanPhone = (body.phone || "").trim() || (targetLake?.phone ?? "");

    if (targetLake) {
      // Try updating with new phone first
      try {
        targetLake = await prisma.fishingLake.update({
          where: { id: targetLake.id },
          data: {
            name: cleanName,
            address: cleanAddress,
            phone: cleanPhone || undefined,
            description: (body.receipt_footer !== undefined ? body.receipt_footer : body.receiptFooter) ?? targetLake.description,
            totalSpots: body.totalSpots ? Number(body.totalSpots) : targetLake.totalSpots,
            bankName: body.bankName !== undefined ? body.bankName : targetLake.bankName,
            bankAccount: body.bankAccount !== undefined ? body.bankAccount : targetLake.bankAccount,
            bankHolder: body.bankHolder !== undefined ? body.bankHolder : targetLake.bankHolder,
            bankBin: body.bankBin !== undefined ? body.bankBin : targetLake.bankBin,
          }
        });
      } catch (phoneErr: any) {
        // If phone unique constraint conflicts, update without changing phone
        targetLake = await prisma.fishingLake.update({
          where: { id: targetLake.id },
          data: {
            name: cleanName,
            address: cleanAddress,
            description: (body.receipt_footer !== undefined ? body.receipt_footer : body.receiptFooter) ?? targetLake.description,
            totalSpots: body.totalSpots ? Number(body.totalSpots) : targetLake.totalSpots,
            bankName: body.bankName !== undefined ? body.bankName : targetLake.bankName,
            bankAccount: body.bankAccount !== undefined ? body.bankAccount : targetLake.bankAccount,
            bankHolder: body.bankHolder !== undefined ? body.bankHolder : targetLake.bankHolder,
            bankBin: body.bankBin !== undefined ? body.bankBin : targetLake.bankBin,
          }
        });
      }
    } else {
      // Create new lake
      targetLake = await prisma.fishingLake.create({
        data: {
          name: cleanName,
          address: cleanAddress,
          phone: cleanPhone || `lake_${Date.now()}`,
          description: body.receipt_footer || body.receiptFooter || "",
          totalSpots: body.totalSpots ? Number(body.totalSpots) : 10,
          bankName: body.bankName || "",
          bankAccount: body.bankAccount || "",
          bankHolder: body.bankHolder || "",
          bankBin: body.bankBin || "",
          managerId: session_auth.user.id || undefined,
        }
      });
    }

    // Sync manager phone number safely in non-blocking try
    if (targetLake.managerId && cleanPhone) {
      try {
        await prisma.user.update({
          where: { id: targetLake.managerId },
          data: { phone: cleanPhone }
        }).catch(() => null);
      } catch {
        // Ignore user phone sync collision
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
        }).catch(() => null);
      } catch {
        // Ignore log failure
      }
    }

    // Sync FishingArea records if totalSpots is provided
    if (body.totalSpots) {
      try {
        const total = Number(body.totalSpots);
        const existingAreas = await prisma.fishingArea.findMany({
          where: { lakeId: targetLake.id },
          orderBy: { name: "asc" }
        }).catch(() => []);

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
            }).catch(() => null);
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
    }, { status: 200 });
  } catch (error: any) {
    console.error("[Update Lake Settings Error Details]:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    return NextResponse.json({ 
      success: false, 
      message: error.message || "Lỗi khi lưu thông tin hồ câu. Vui lòng thử lại." 
    }, { status: 400 });
  }
}
