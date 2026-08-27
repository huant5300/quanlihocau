"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordActivityLog } from "@/lib/activity-log";
import { UserRole } from "@prisma/client";

import { assertLakeWriteAccess } from "@/lib/subscription-guard";

export async function getSessionsAction() {
  try {
    const lakeId = await getActiveLakeId();
    const sessions = await prisma.fishingSession.findMany({
      where: { lakeId },
      include: {
        customer: true,
        area: true,
        fishCatches: {
          include: {
            fishType: true
          }
        },
        invoices: {
          include: {
            items: true
          }
        }
      },
      orderBy: { startTime: "desc" }
    });
    return { success: true, data: sessions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function startFishingAction(areaId: string, customerId?: string, packageId?: string) {
  try {
    const session_auth = await auth();
    const isOwner = session_auth?.user?.role === UserRole.OWNER || session_auth?.user?.role === UserRole.SUPER_ADMIN;

    const lakeId = await getActiveLakeId();
    if (!lakeId) throw new Error("Không tìm thấy hồ câu hoạt động");

    // Subscription check: Disallow starting sessions if subscription expired
    const subCheck = await assertLakeWriteAccess(lakeId);
    if (!subCheck.success) {
      return { success: false, error: subCheck.error, code: subCheck.code };
    }
    
    // Check if area exists
    const area = await prisma.fishingArea.findUnique({ where: { id: areaId } });
    if (!area) {
      throw new Error("Không tìm thấy hồ câu này");
    }

    if (area.lakeId !== lakeId) {
      throw new Error("Bạn không có quyền truy cập khu vực này");
    }

    if (area.status !== "AVAILABLE" && !isOwner) {
      throw new Error("Hồ câu này hiện không sẵn sàng (đang có người câu hoặc bảo trì)");
    }

    // Create session
    const session = await prisma.fishingSession.create({
      data: {
        lakeId,
        areaId,
        customerId: customerId || undefined,
        packageId: packageId || undefined,
        startTime: new Date(),
        status: "ACTIVE",
        hourlyRate: area.hourlyRate,
      }
    });

    if (session_auth?.user?.id) {
      await recordActivityLog(session_auth.user.id, "START_SESSION", {
        sessionId: session.id,
        areaName: area.name,
        packageId: packageId || "Giờ lẻ",
      });
    }

    // Update area status to OCCUPIED
    await prisma.fishingArea.update({
      where: { id: areaId },
      data: { status: "OCCUPIED" }
    });

    revalidatePath("/dashboard/sessions");
    revalidatePath("/dashboard");
    return { success: true, data: session };
  } catch (error: any) {
    console.error("Error in startFishingAction:", error);
    return { success: false, error: error.message };
  }
}

export async function completeFishingAction(sessionId: string) {
  try {
    const session = await prisma.fishingSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
      }
    });

    // Free up the area
    await prisma.fishingArea.update({
      where: { id: session.areaId },
      data: { status: "AVAILABLE" }
    });

    const session_auth = await auth();
    if (session_auth?.user?.id) {
      await recordActivityLog(session_auth.user.id, "COMPLETE_SESSION", {
        sessionId: session.id,
      });
    }

    revalidatePath("/dashboard/sessions");
    return { success: true, data: session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Hủy ca câu (Critical Action -> Log vào AuditLog)
 */
export async function cancelFishingAction(sessionId: string, reason: string) {
  try {
    const session_auth = await auth();
    if (!session_auth?.user?.id) return { success: false, error: "Unauthorized" };

    const session = await prisma.fishingSession.findUnique({
      where: { id: sessionId },
      include: { area: true },
    });

    if (!session) return { success: false, error: "Không tìm thấy ca câu" };

    const updated = await prisma.fishingSession.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        endTime: new Date(),
      },
    });

    // Giải phóng ô câu
    await prisma.fishingArea.update({
      where: { id: session.areaId },
      data: { status: "AVAILABLE" },
    });

    // Ghi Audit Trail
    const { logAuditTrail } = await import("@/lib/audit-trail");
    await logAuditTrail({
      userId: session_auth.user.id,
      lakeId: session.lakeId,
      action: "SESSION_CANCEL",
      details: {
        sessionId: session.id,
        areaName: session.area?.name,
        reason,
      },
    });

    revalidatePath("/dashboard/sessions");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in cancelFishingAction:", error);
    return { success: false, error: error.message || "Lỗi khi hủy ca câu" };
  }
}

/**
 * Điều chỉnh đơn giá / Miễn giảm giờ câu (Critical Action -> Log vào AuditLog)
 */
export async function overrideSessionPriceAction(sessionId: string, newHourlyRate: number, reason: string) {
  try {
    const session_auth = await auth();
    if (!session_auth?.user?.id) return { success: false, error: "Unauthorized" };

    const session = await prisma.fishingSession.findUnique({
      where: { id: sessionId },
      include: { area: true },
    });

    if (!session) return { success: false, error: "Không tìm thấy ca câu" };

    const oldHourlyRate = Number(session.hourlyRate);

    const updated = await prisma.fishingSession.update({
      where: { id: sessionId },
      data: {
        hourlyRate: newHourlyRate,
      },
    });

    // Ghi Audit Trail
    const { logAuditTrail } = await import("@/lib/audit-trail");
    await logAuditTrail({
      userId: session_auth.user.id,
      lakeId: session.lakeId,
      action: "PRICE_OVERRIDE",
      details: {
        sessionId: session.id,
        areaName: session.area?.name,
        oldHourlyRate,
        newHourlyRate,
        reason,
      },
    });

    revalidatePath("/dashboard/sessions");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in overrideSessionPriceAction:", error);
    return { success: false, error: error.message || "Lỗi khi điều chỉnh giá ca câu" };
  }
}
