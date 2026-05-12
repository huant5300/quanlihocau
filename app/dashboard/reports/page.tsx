import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ReportsClient } from "./reports-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ReportsPage() {
  const session = await auth();
  
  // Aggregate revenue for the last 30 days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const revenueData = await prisma.fishingSession.groupBy({
    by: ['updatedAt'],
    _sum: { sessionAmount: true },
    where: { status: "COMPLETED", updatedAt: { gte: last30Days } },
  });

  // Simplified format for charts
  const chartData = revenueData.map(d => ({
    date: d.updatedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    amount: Number(d._sum.sessionAmount || 0)
  }));

  const topProducts = await prisma.invoiceItem.groupBy({
    by: ['description'],
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Báo cáo & Thống kê" 
        subtitle="Phân tích dữ liệu kinh doanh và hiệu suất hồ câu."
        actions={
          <Button className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold flex items-center gap-2">
            <FileDown size={18} />
            Xuất báo cáo
          </Button>
        }
      />
      
      <ReportsClient 
        revenueChartData={chartData}
        topProducts={JSON.parse(JSON.stringify(topProducts))}
      />
    </div>
  );
}
