import prisma from "@/lib/prisma";
import { SessionsClient } from "./sessions-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";

export default async function SessionsPage() {
  const [sessions, areas, customers] = await Promise.all([
    prisma.fishingSession.findMany({
      where: { status: "ACTIVE" },
      include: {
        area: true,
        customer: true,
        fishCatches: { include: { fishType: true } }
      },
      orderBy: { startTime: "desc" }
    }),
    prisma.fishingArea.findMany({ where: { status: "AVAILABLE" } }),
    prisma.customer.findMany()
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Quản lý Lượt câu" 
        subtitle="Theo dõi và quản lý các chòi đang hoạt động tại hồ."
      />
      
      <SessionsClient 
        initialSessions={JSON.parse(JSON.stringify(sessions))} 
        availableAreas={JSON.parse(JSON.stringify(areas))}
        customers={JSON.parse(JSON.stringify(customers))}
      />
    </div>
  );
}