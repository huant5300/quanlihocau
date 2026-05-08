"use client";

import React, { useState } from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { StatsGrid } from "@/modules/reports/components/stats-grid";
import { RevenueChart } from "@/modules/reports/components/revenue-chart";
import { PopularProducts } from "@/modules/reports/components/popular-products";
import { TopCustomers } from "@/modules/reports/components/top-customers";
import { FileDown, Calendar, Filter } from "lucide-react";
import { cn } from "@/utils/utils";

export default function ReportsPage() {
  const [range, setRange] = useState("Week");

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Báo cáo & Phân tích" 
          subtitle="Theo dõi hiệu quả kinh doanh và xu hướng vận hành hồ câu."
          actions={
            <button className="h-14 px-6 bg-accent text-foreground rounded-2xl font-black flex items-center gap-3 border border-border/50 hover:bg-accent/80 transition-all active:scale-95">
              <FileDown size={20} />
              <span>Xuất dữ liệu</span>
            </button>
          }
        />
      }
    >
      <div className="space-y-10">
        {/* Filters & Quick Selection */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex bg-accent/50 p-1.5 rounded-2xl border border-border/20">
            {["Today", "Week", "Month", "Year"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  range === r ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
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
          
          <RevenueChart />
        </div>

        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <PopularProducts />
          <TopCustomers />
        </div>
      </div>
    </DashboardLayout>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
