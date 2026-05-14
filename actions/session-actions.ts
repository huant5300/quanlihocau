"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";

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
    const lakeId = await getActiveLakeId();
    
    // Check if area is available
    const area = await prisma.fishingArea.findUnique({ where: { id: areaId } });
    if (!area || area.status !== "AVAILABLE") {
      throw new Error("Khu vực này hiện không sẵn sàng");
    }

    const session = await prisma.fishingSession.create({
      data: {
        lakeId,
        areaId,
        customerId,
        packageId,
        startTime: new Date(),
        status: "ACTIVE",
        hourlyRate: area.hourlyRate,
      }
    });

    // Update area status
    await prisma.fishingArea.update({
      where: { id: areaId },
      data: { status: "OCCUPIED" }
    });

    revalidatePath("/dashboard/sessions");
    return { success: true, data: session };
  } catch (error: any) {
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

    revalidatePath("/dashboard/sessions");
    return { success: true, data: session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
