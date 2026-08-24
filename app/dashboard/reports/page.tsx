import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ReportsClient } from "./reports-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveLakeId } from "@/lib/lake-context";

export default async function ReportsPage() {
  try {
    const session = await auth();
    const lakeId = await getActiveLakeId();
    
    // Aggregate revenue for the last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [revenueData, topProducts, catchesIn30Days] = await Promise.all([
      prisma.fishingSession.groupBy({
        by: ['updatedAt'],
        _sum: { sessionAmount: true },
        where: { 
          lakeId: lakeId || "",
          status: "COMPLETED", 
          updatedAt: { gte: last30Days } 
        },
      }).catch(() => []),
      prisma.invoiceItem.groupBy({
        by: ['description'],
        _sum: { quantity: true, totalPrice: true },
        where: {
          invoice: {
            lakeId: lakeId || ""
          }
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }).catch(() => []),
      prisma.fishCatch.findMany({
        where: {
          session: {
            lakeId: lakeId || ""
          },
          createdAt: { gte: last30Days }
        },
        include: {
          session: {
            include: {
              customer: true
            }
          },
          fishType: true
        }
      }).catch(() => [])
    ]);

    // Simplified format for charts
    const chartData = (revenueData || []).map(d => ({
      date: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : "",
      amount: Number(d._sum?.sessionAmount || 0)
    }));

    // Calculate: Cần thủ câu nhiều cá nhất
    const customerCatchCounts: Record<string, { customer: any, count: number }> = {};
    let topCatcher = null;
    let maxCatches = 0;

    (catchesIn30Days || []).forEach(c => {
      const customer = c.session?.customer;
      if (!customer) return;
      const cid = customer.id;
      if (!customerCatchCounts[cid]) {
        customerCatchCounts[cid] = { customer, count: 0 };
      }
      customerCatchCounts[cid].count += 1;
      if (customerCatchCounts[cid].count > maxCatches) {
        maxCatches = customerCatchCounts[cid].count;
        topCatcher = {
          name: customer.fullName,
          phone: customer.phone,
          count: maxCatches
        };
      }
    });

    // Calculate: Cần thủ câu cá lớn nhất (kỷ lục cá câu)
    let biggestCatch = null;
    let maxWeight = 0;

    (catchesIn30Days || []).forEach(c => {
      const weight = Number(c.weight || 0);
      const customer = c.session?.customer;
      if (weight > maxWeight && customer) {
        maxWeight = weight;
        biggestCatch = {
          customerName: customer.fullName,
          customerPhone: customer.phone,
          fishName: c.fishType?.name || "Cá",
          weight: maxWeight,
          amount: Number(c.totalAmount || 0)
        };
      }
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
          topProducts={JSON.parse(JSON.stringify(topProducts || []))}
          topCatcher={topCatcher}
          biggestCatch={biggestCatch}
        />
      </div>
    );
  } catch (error) {
    console.error("ReportsPage error:", error);
    return (
      <div className="space-y-8">
        <DashboardHeader 
          title="Báo cáo & Thống kê" 
          subtitle="Phân tích dữ liệu kinh doanh và hiệu suất hồ câu."
        />
        <ReportsClient 
          revenueChartData={[]}
          topProducts={[]}
          topCatcher={null}
          biggestCatch={null}
        />
      </div>
    );
  }
}
