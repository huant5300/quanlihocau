"use client";

import React from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Download, 
  Calendar, 
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  RevenueChart, 
  ProductPieChart, 
  CustomerTrendChart 
} from "@/modules/reports/components/report-charts";
import { motion } from "framer-motion";

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-10 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <BarChart3 size={28} />
              <h1 className="text-3xl font-black tracking-tight">Báo cáo & Phân tích</h1>
            </div>
            <p className="text-muted-foreground">Theo dõi doanh thu, hiệu suất và xu hướng khách hàng.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-14 px-6 bg-card border-2 border-transparent hover:border-primary/20 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-sm">
              <Calendar size={20} /> 01/05 - 08/05
            </button>
            <button className="h-14 bg-primary text-white px-8 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Download size={20} /> Xuất dữ liệu
            </button>
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Tổng doanh thu" 
            value="142.500.000đ" 
            trend="+12.5%" 
            isUp={true} 
            icon={<DollarSign size={20} />} 
          />
          <MetricCard 
            title="Khách hàng mới" 
            value="124" 
            trend="+8.2%" 
            isUp={true} 
            icon={<Users size={20} />} 
          />
          <MetricCard 
            title="Lượt câu hoàn tất" 
            value="456" 
            trend="+15%" 
            isUp={true} 
            icon={<TrendingUp size={20} />} 
          />
          <MetricCard 
            title="Giá trị trung bình" 
            value="312.000đ" 
            trend="-2.4%" 
            isUp={false} 
            icon={<BarChart3 size={20} />} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border-2 border-border/50 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">Xu hướng doanh thu</h3>
              <select className="bg-muted/50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
            </div>
            <RevenueChart />
          </div>

          {/* Product Pie Chart */}
          <div className="bg-card p-8 rounded-[2.5rem] border-2 border-border/50 space-y-6">
            <h3 className="text-lg font-black tracking-tight">Cơ cấu sản phẩm</h3>
            <ProductPieChart />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0EA5E9]" /> Mồi câu</span>
                <span>45%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10B981]" /> Thức ăn</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          {/* Customer Bar Chart */}
          <div className="lg:col-span-3 bg-card p-8 rounded-[2.5rem] border-2 border-border/50 space-y-6">
            <h3 className="text-lg font-black tracking-tight">Tần suất khách hàng</h3>
            <CustomerTrendChart />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function MetricCard({ title, value, trend, isUp, icon }: { title: string; value: string; trend: string; isUp: boolean; icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 bg-card border-2 border-border/50 rounded-[2rem] space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isUp ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <h4 className="text-xl font-black mt-1 tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}
