"use server";

import { SessionService } from "@/services/session-service";
import { revalidatePath } from "next/cache";

export async function startFishingAction(lakeId: string, areaId: string, customerId?: string) {
  try {
    const session = await SessionService.startSession(lakeId, areaId, customerId);
    revalidatePath("/dashboard/sessions");
    return { success: true, data: session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeFishingAction(sessionId: string) {
  try {
    const session = await SessionService.completeSession(sessionId);
    revalidatePath("/dashboard/sessions");
    return { success: true, data: session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
