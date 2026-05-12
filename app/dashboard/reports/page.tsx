"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { StatsGrid } from "@/modules/reports/components/stats-grid";
import dynamic from "next/dynamic";
import { FileDown, Calendar, TrendingUp, Loader2 } from "lucide-react";

const RevenueChart = dynamic(() => import("@/modules/reports/components/revenue-chart").then(mod => mod.RevenueChart), {
  ssr: false,
  loading: () => <div className="h-80 w-full bg-accent/20 animate-pulse rounded-3xl" />
});

const PopularProducts = dynamic(() => import("@/modules/reports/components/popular-products").then(mod => mod.PopularProducts), {
  ssr: false,
  loading: () => <div className="h-80 w-full bg-accent/20 animate-pulse rounded-3xl" />
});

const TopCustomers = dynamic(() => import("@/modules/reports/components/top-customers").then(mod => mod.TopCustomers), {
  ssr: false,
  loading: () => <div className="h-80 w-full bg-accent/20 animate-pulse rounded-3xl" />
});
import { cn } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/api/report-service";

export default function ReportsPage() {
  const { data: revenueData = [], isLoading: isRevenueLoading } = useQuery({
    queryKey: ["report-revenue", "Week"],
    queryFn: () => reportService.getRevenueStats("Week"),
  });

  const { data: popularProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["report-popular-products"],
    queryFn: () => reportService.getPopularProducts(),
  });

  const { data: topCustomers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ["report-top-customers"],
    queryFn: () => reportService.getTopCustomers(),
  });

  const isLoading = isRevenueLoading || isProductsLoading || isCustomersLoading;

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Báo cáo & Phân tích" 
          subtitle="Theo dõi hiệu quả kinh doanh và xu hướng vận hành hồ câu."
          actions={
            <button 
              onClick={() => {
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/reports/export/?type=revenue`;
                window.open(url, '_blank');
              }}
              className="h-14 px-6 bg-accent text-foreground rounded-2xl font-black flex items-center gap-3 border border-border/50 hover:bg-accent/80 transition-all active:scale-95"
            >
              <FileDown size={20} />
              <span>Xuất dữ liệu</span>
            </button>
          }
        />
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Filters & Quick Selection */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex bg-accent/50 p-1.5 rounded-2xl border border-border/20">
              {["Today", "Week", "Month", "Year"].map((r) => (
                <button
                  key={r}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    r === "Week" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r === "Today" ? "Hôm nay" : r === "Week" ? "Tuần" : r === "Month" ? "Tháng" : "Năm"}
                </button>
              ))}
            </div>
            
            <button className="h-12 px-6 bg-accent/50 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50">
              <Calendar size={16} />
              <span>01/05 - 08/05</span>
            </button>
          </div>

          {/* Stats Grid */}
          <StatsGrid />

          {/* Main Revenue Chart */}
          <div className="glass-card p-8 rounded-[3rem] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight uppercase">Biểu đồ doanh thu</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Xu hướng 7 ngày gần nhất</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Doanh thu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Lượt câu</span>
                </div>
              </div>
            </div>
            
            <RevenueChart data={revenueData} />
          </div>

          {/* Detailed Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            <PopularProducts initialProducts={popularProducts} />
            <TopCustomers initialCustomers={topCustomers} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
