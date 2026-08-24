import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { ActivityLogClient } from "./activity-log-client";

export default async function ActivityLogPage() {
  try {
    const session = await auth();
    const lakeId = await getActiveLakeId();

    const logs = await prisma.activityLog.findMany({
      where: {
        OR: lakeId ? [{ lakeId }, { lakeId: null }] : [{ lakeId: null }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }).catch(() => []);

    const initialLogs = (logs || []).map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details as any,
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
      user: {
        id: log.user?.id || "system",
        name: log.user?.name || "Hệ thống",
        email: log.user?.email || null,
        image: log.user?.image || null,
      },
    }));

    return <ActivityLogClient initialLogs={initialLogs} />;
  } catch (error) {
    console.error("ActivityLogPage error:", error);
    return <ActivityLogClient initialLogs={[]} />;
  }
}
