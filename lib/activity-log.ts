import prisma from "@/lib/prisma";

interface ActivityLogOptions {
  lakeId?: string;
  entityType?: "SESSION" | "PRODUCT" | "FISH" | "PAYMENT" | "CUSTOMER" | "INVOICE" | "SHIFT";
  entityId?: string;
}

export async function recordActivityLog(
  userId: string,
  action: string,
  details?: any,
  options?: ActivityLogOptions
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        lakeId: options?.lakeId,
        entityType: options?.entityType,
        entityId: options?.entityId,
      },
    });
  } catch (error) {
    console.error("Error writing activity log:", error);
  }
}
