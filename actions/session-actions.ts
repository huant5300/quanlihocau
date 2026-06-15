"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordActivityLog } from "@/lib/activity-log";

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
    const userEmail = session_auth?.user?.email;
    const isOwner = userEmail === "huant5300@gmail.com";

    const lakeId = await getActiveLakeId();
    
    // Check if area exists
    const area = await prisma.fishingArea.findUnique({ where: { id: areaId } });
    if (!area) {
      throw new Error("Không tìm thấy hồ câu này");
    }

    // Only check availability if not the owner (bypass for administrator)
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
