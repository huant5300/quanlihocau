import prisma from "@/lib/prisma";
import { SessionsClient } from "./sessions-client";
import { getActiveLakeId } from "@/lib/lake-context";

export default async function SessionsPage() {
  try {
    const lakeId = await getActiveLakeId();

    const sessions = await prisma.fishingSession.findMany({
      where: { 
        lakeId: lakeId || "",
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
    }).catch(() => []);

    return (
      <SessionsClient 
        initialSessions={JSON.parse(JSON.stringify(sessions || []))} 
      />
    );
  } catch (error) {
    console.error("SessionsPage error:", error);
    return <SessionsClient initialSessions={[]} />;
  }
}