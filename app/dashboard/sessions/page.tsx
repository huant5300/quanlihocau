import prisma from "@/lib/prisma";
import { SessionsClient } from "./sessions-client";
import { getActiveLakeId } from "@/lib/lake-context";

export default async function SessionsPage() {
  const lakeId = await getActiveLakeId();

  const sessions = await prisma.fishingSession.findMany({
    where: { 
      lakeId,
      status: "ACTIVE" 
    },
    include: {
      area: true,
      customer: true,
      fishCatches: { include: { fishType: true } },
      invoices: {
        where: { status: "UNPAID" },
        include: { items: true }
      }
    },
    orderBy: { startTime: "desc" }
  });

  return (
    <SessionsClient 
      initialSessions={JSON.parse(JSON.stringify(sessions))} 
    />
  );
}