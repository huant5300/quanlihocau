import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { ActivityLogClient } from "./activity-log-client";

export default async function ActivityLogPage() {
  const session = await auth();
  const lakeId = await getActiveLakeId();

  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [{ lakeId }, { lakeId: null }],
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const initialLogs = logs.map((log) => ({
    id: log.id,
    action: log.action,
    details: log.details as any,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt.toISOString(),
    user: {
      id: log.user.id,
      name: log.user.name,
      email: log.user.email,
      image: log.user.image,
    },
  }));

  return <ActivityLogClient initialLogs={initialLogs} />;
}
