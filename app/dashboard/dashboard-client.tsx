"use client";

import React from "react";
import { 
  DollarSign, 
  Users, 
  Fish, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { axiosApiClient } from "@/services/api/axios-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { cn } from "@/utils/utils";

interface DashboardClientProps {
  initialData: {
    activeSessions: number;
    todayRevenue: number;
    totalCustomers: number;
    todayCatchesCount: number;
    topCatches: { name: string; count: number }[];
    spotsCount: number;
    revenueChart: { date: string; amount: number }[];
    recentTransactions: {
      id: string;
      amount: number;
      type: string;
      category: string | null;
      description: string;
      createdAt: string;
    }[];
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { data = initialData, isRefetching, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await axiosApiClient.get<any>("/api/v1/dashboard/stats");
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch stats");
      return response.data;
    },
    initialData,
    refetchInterval: 15000, // Refresh every 15 seconds for real-time feel
  });

  const stats = [
    { 
      label: "Doanh thu hôm nay", 
      value: `${Number(data?.todayRevenue || 0).toLocaleString()}đ`, 
      icon: DollarSign, 
      color: "text-green-500", 
      bg: "bg-green-500/10" 
    },
    { 
      label: "Lượt câu đang hoạt động", 
      value: (data?.activeSessions ?? 0).toString(), 
      icon: Activity, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Tổng hội viên", 
      value: (data?.totalCustomers ?? 0).toString(), 
      icon: Users, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10" 
    },
    { 
      label: "Cá đã thu hôm nay", 
      value: `${data?.todayCatchesCount ?? 0} con`, 
      icon: Fish, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10" 
    },
  ];

  const fillRate = (data?.spotsCount ?? 0) > 0 
    ? Math.round(((data?.activeSessions ?? 0) / (data?.spotsCount ?? 1)) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            Tổng quan hệ thống
            {isRefetching && (
              <RefreshCw size={20} className="text-primary animate-spin" />
            )}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar size={14} />
            Hôm nay, {format(new Date(), "eeee, dd MMMM yyyy", { locale: vi })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
          >
            <RefreshCw size={14} className={cn(isRefetching && "animate-spin")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Làm mới</span>
          </button>
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Hệ thống Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
          >
            <div className={stat.bg + " absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"} />
            <div className="relative z-10">
              <div className={stat.color + " mb-4"}>
                <stat.icon size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight">Doanh thu 7 ngày qua</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                Xu hướng tuần
              </span>
            </div>
            <div className="h-[300px] w-full">
              {data?.revenueChart && data?.revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueChart}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                      tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'black' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()}đ`, "Doanh thu"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                  Chưa có dữ liệu giao dịch trong tuần qua
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-8 rounded-[3rem]">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">Hoạt động thanh toán mới nhất</h2>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {data?.recentTransactions && data?.recentTransactions.length > 0 ? (
                  data?.recentTransactions.map((tx: any) => (
                    <motion.div 
                      layout
                      key={tx.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-4 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <TrendingUp size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{tx.description}</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">
                          {format(new Date(tx.createdAt), "HH:mm - dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-500">
                          +{Number(tx.amount).toLocaleString()}đ
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground italic text-sm">
                    Chưa ghi nhận hoạt động thanh toán nào hôm nay
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Lake Status Spot - Unified spot terminology */}
          <div className="glass-card p-8 rounded-[3rem] bg-primary/5 border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-primary/5 -mr-8 -mt-8 opacity-50" />
            <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              Trạng thái hồ câu
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Ô đang câu</span>
                <span className="px-3 py-1.5 bg-primary text-white rounded-full text-[10px] font-black shadow-lg shadow-primary/20">
                  {data?.activeSessions ?? 0} / {data?.spotsCount ?? 0} ô
                </span>
              </div>
              <div className="w-full h-3 bg-accent rounded-full overflow-hidden border border-border/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${fillRate}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-primary rounded-full shadow-inner" 
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                * Tỷ lệ lấp đầy: {fillRate}% ({data?.activeSessions ?? 0}/{data?.spotsCount ?? 0} ô đang hoạt động)
              </p>
            </div>
          </div>

          {/* Real-time Top Catches - Reporting fish count instead of kg */}
          <div className="glass-card p-8 rounded-[3rem]">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Top cá thu hôm nay</h2>
            <div className="space-y-4">
              {data?.topCatches && data?.topCatches.length > 0 ? (
                data?.topCatches.map((fish: any, i: number) => (
                  <div key={fish.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-primary bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center">
                        0{i+1}
                      </span>
                      <span className="text-sm font-black uppercase tracking-tight">{fish.name}</span>
                    </div>
                    <span className="text-xs font-black text-muted-foreground bg-accent px-3 py-1.5 rounded-xl border border-border/50">
                      {fish.count} con
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground italic text-sm">
                  Chưa ghi nhận lượt thu mua cá nào hôm nay
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
