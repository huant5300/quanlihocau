"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  Users, 
  Activity, 
  Calendar, 
  RefreshCw,
  Banknote,
  CreditCard,
  Ticket,
  Search,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { axiosApiClient } from "@/services/api/axios-client";
import { sessionService } from "@/services/api/session-service";
import { SessionRow } from "@/modules/sessions/components/session-row";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";

type Period = "today" | "week" | "month" | "year";

interface DashboardClientProps {
  initialData: {
    activeSessions: number;
    activeSessionsList?: any[];
    todayRevenue: number;
    totalRevenue?: number;
    ticketRevenue?: number;
    productRevenue?: number;
    cashRevenue?: number;
    transferRevenue?: number;
    totalCustomers: number;
    periodCustomerCount?: number;
    todayCatchesCount: number;
    periodSessionCount?: number;
    topCatches: { name: string; count: number }[];
    spotsCount: number;
    revenueChart: { date: string; amount: number; tickets?: number }[];
    period?: string;
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

const periodLabels: Record<Period, string> = {
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  year: "Năm nay",
};

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [mounted, setMounted] = React.useState(false);
  const [timeStr, setTimeStr] = React.useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = React.useState<Period>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const { setOpenSessionModalOpen } = useUIStore();

  React.useEffect(() => {
    setMounted(true);
    setTimeStr(new Date().toLocaleTimeString("vi-VN", { hour12: false }));
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString("vi-VN", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Fetch Stats based on selected period
  const { data: statsData = initialData, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriod],
    queryFn: async () => {
      const response = await axiosApiClient.get<any>(`/api/v1/dashboard/stats?period=${selectedPeriod}`);
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch stats");
      return response.data?.data || response.data;
    },
    initialData: selectedPeriod === "today" ? initialData : undefined,
    staleTime: 10000,
    refetchInterval: 10000,
  });

  // 2. Fetch Active Sessions in Real-time (10s refetch)
  const { data: activeSessions = initialData.activeSessionsList || [], refetch: refetchSessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => sessionService.getSessions("ACTIVE"),
    initialData: initialData.activeSessionsList,
    staleTime: 10000,
    refetchInterval: 10000,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchSessions();
  };

  const filteredSessions = activeSessions.filter((s: any) => {
    const areaName = s.area?.name || "";
    const customerName = s.customer?.fullName || "Khách lẻ";
    const customerPhone = s.customer?.phone || "";
    const query = searchQuery.toLowerCase();
    return (
      areaName.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      customerPhone.toLowerCase().includes(query)
    );
  });

  // Large Stats Cards configuration
  const stats = [
    { 
      label: "Tổng doanh thu", 
      value: `${Number(statsData?.totalRevenue || statsData?.todayRevenue || 0).toLocaleString()}đ`, 
      icon: DollarSign, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      href: "/dashboard/reports",
      gradient: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20"
    },
    { 
      label: "Số khách đang câu", 
      value: `${statsData?.activeSessions ?? 0} ô`, 
      icon: Activity, 
      color: "text-sky-500", 
      bg: "bg-sky-500/10",
      href: "/dashboard/sessions",
      gradient: "from-sky-500/10 to-blue-500/5 border-sky-500/20"
    },
    { 
      label: "Vé đã bán", 
      value: `${statsData?.periodSessionCount ?? 0} vé`, 
      icon: Ticket, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10",
      href: "/dashboard/sessions",
      gradient: "from-purple-500/10 to-indigo-500/5 border-purple-500/20"
    },
    { 
      label: "Doanh thu tiền mặt", 
      value: `${Number(statsData?.cashRevenue || 0).toLocaleString()}đ`, 
      icon: Banknote, 
      color: "text-emerald-600", 
      bg: "bg-emerald-500/10",
      href: "/dashboard/reports",
      gradient: "from-emerald-600/10 to-emerald-500/5 border-emerald-600/20"
    },
    { 
      label: "Doanh thu chuyển khoản", 
      value: `${Number(statsData?.transferRevenue || 0).toLocaleString()}đ`, 
      icon: CreditCard, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      href: "/dashboard/reports",
      gradient: "from-blue-500/10 to-indigo-500/5 border-blue-500/20"
    },
    { 
      label: "Hôm nay", 
      value: mounted ? format(new Date(), "dd/MM/yyyy") : "--/--/----", 
      icon: Calendar, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10",
      href: "#",
      gradient: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
      customValue: mounted ? (
        <div className="flex flex-col items-start">
          <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider">
            {format(new Date(), "eeee", { locale: vi })}
          </span>
          <span className="text-xl font-black mt-0.5 tracking-tight">
            {timeStr || "--:--:--"}
          </span>
        </div>
      ) : null
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            Bảng Điều Khiển
          </h1>
          <p className="text-muted-foreground mt-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống quản lý hồ câu live
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefreshAll}
            className="h-14 px-6 bg-card border border-border rounded-2xl flex items-center justify-center gap-2 hover:bg-accent active:scale-95 transition-all text-xs font-black uppercase tracking-wider"
          >
            <RefreshCw size={16} className="animate-spin duration-1000" />
            <span>Làm mới</span>
          </button>
          <div className="flex items-center gap-2 bg-card rounded-2xl p-1 border border-border h-14">
            {(Object.entries(periodLabels) as [Period, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={cn(
                  "px-4 h-full rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                  selectedPeriod === key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Large Stats Grid (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <div key={stat.label} className="block cursor-pointer">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "p-5 rounded-[2rem] border relative overflow-hidden h-32 flex flex-col justify-between transition-all bg-gradient-to-br shadow-sm hover:scale-[1.02] active:scale-[0.98] duration-300 select-none",
                stat.gradient
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <div className={cn("p-2 rounded-xl bg-background/50", stat.color)}>
                  <stat.icon size={16} />
                </div>
              </div>
              {stat.customValue ? (
                stat.customValue
              ) : (
                <h3 className="text-xl font-black tracking-tight truncate">{stat.value}</h3>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Active Fishing Sessions (Center & takes 70% space) */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-border/60 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Activity className="text-emerald-500 animate-pulse" size={20} />
              Danh Sách Đang Câu
            </h2>
            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">
              Theo dõi thời gian thực các ô đang hoạt động tại hồ
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Google-like search bar */}
            <div className="relative flex-1 md:w-80 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Tìm ô số, khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-11 pr-4 bg-card/60 backdrop-blur-md rounded-2xl border border-border focus:border-emerald-500/40 outline-none font-bold text-xs transition-all placeholder:text-muted-foreground/60 shadow-sm"
              />
            </div>
            
            {/* Create Ticket Button (height 56px) */}
            <button 
              onClick={() => setOpenSessionModalOpen(true)}
              className="h-14 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <Plus size={16} />
              Mở lượt câu
            </button>
          </div>
        </div>

        {/* Sessions list */}
        {isSessionsLoading && activeSessions.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card/40 animate-pulse rounded-2xl border border-border/50" />
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session: any) => (
                <SessionRow 
                  key={session.id} 
                  session={{
                    ...session,
                    hut_number: session.area?.name || "N/A",
                    customer_name: session.customer?.fullName || "Khách lẻ",
                    phone: session.customer?.phone,
                    total_amount: Number(session.sessionAmount || 0),
                    session_products: session.invoices?.[0]?.items?.map((item: any) => ({
                      id: item.id,
                      name: item.description,
                      quantity: item.quantity,
                      price: Number(item.unitPrice)
                    })) || [],
                    fish_buybacks: session.fishCatches?.map((c: any) => ({
                      id: c.id,
                      total_price: Number(c.totalAmount),
                      weight: Number(c.weight || 0),
                      fish_name: c.fishType?.name || "Cá"
                    })) || []
                  }} 
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-60 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Activity size={32} className="opacity-20" />
            <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Không có lượt câu nào hoạt động</p>
          </div>
        )}
      </div>
    </div>
  );
}
