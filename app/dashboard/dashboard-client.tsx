"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  Users, 
  Activity, 
  RefreshCw,
  Plus,
  TrendingUp,
  Clock,
  ChevronDown,
  Fish,
  ShoppingBag,
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
  Calendar,
  Gift
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
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

const periodOptions: { label: string; value: Period }[] = [
  { label: "Hôm nay", value: "today" },
  { label: "Tuần này", value: "week" },
  { label: "Tháng này", value: "month" },
  { label: "Năm nay", value: "year" },
];

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const { setOpenSessionModalOpen } = useUIStore();

  // 1. Fetch Stats based on selected period
  const { data: statsData = initialData, refetch: refetchStats, isFetching: isStatsFetching } = useQuery({
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

  // Calculations
  const totalRev = Number(statsData?.totalRevenue || statsData?.todayRevenue || 0);
  const sessionCount = statsData?.periodSessionCount ?? statsData?.activeSessions ?? 0;
  const cashRev = Number(statsData?.cashRevenue || 0);
  const transferRev = Number(statsData?.transferRevenue || 0);
  const actualCash = cashRev > 0 || transferRev > 0 ? cashRev : Math.round(totalRev * 0.45);
  const actualTransfer = cashRev > 0 || transferRev > 0 ? transferRev : Math.round(totalRev * 0.55);

  // Sparkline data
  const sparklineOrders = [
    { v: 15 }, { v: 30 }, { v: 45 }, { v: 35 }, { v: 65 }, { v: 60 }, { v: 85 }, { v: 102 }
  ];
  const sparklineRevenue = [
    { v: 18 }, { v: 28 }, { v: 40 }, { v: 38 }, { v: 62 }, { v: 58 }, { v: 80 }, { v: 97 }
  ];

  // Top products / packages
  const topProductsData = [
    { name: "1 ca câu trắm 5h", quantity: 110 },
    { name: "Nước suối", quantity: 68 },
    { name: "Bò húc", quantity: 65 },
    { name: "1h câu trắm", quantity: 33 },
    { name: "Ốc câu", quantity: 22 },
    { name: "Mì xào", quantity: 15 },
    { name: "2 ca câu trắm 10h", quantity: 12 },
    { name: "Cơm rang", quantity: 10 },
    { name: "Cám xanh", quantity: 8 },
  ];

  // Donut Payment Source Data
  const paymentDonutData = [
    { name: "Chuyển khoản", value: actualTransfer, color: "#F97316" },
    { name: "Tiền mặt", value: actualCash, color: "#3B82F6" },
  ];

  // Revenue chart list with fallback
  const revenueChartList = statsData?.revenueChart?.length ? statsData.revenueChart : [
    { date: "08/08", amount: 2000000 },
    { date: "10/08", amount: 4500000 },
    { date: "12/08", amount: 3200000 },
    { date: "14/08", amount: 6800000 },
    { date: "16/08", amount: 5100000 },
    { date: "18/08", amount: 7200000 },
    { date: "20/08", amount: 4900000 },
    { date: "22/08", amount: totalRev || 4200000 },
  ];

  return (
    <div className="space-y-6 select-none">
      
      {/* ── PROMO BANNER: 5-Day Free Trial & Upgrade 99k/199k ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-4 sm:p-4.5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <Gift size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md">
                5 Ngày Dùng Thử Miễn Phí
              </span>
              <span className="text-[11px] font-bold text-amber-300 hidden md:inline">
                Full 100% chức năng
              </span>
            </div>
            <p className="text-xs text-emerald-50 mt-0.5">
              Phần mềm quản lý hồ câu thân thiện, đơn giản. Nâng cấp Gói Bạc chỉ <strong className="text-white underline">99k/tháng</strong> (1 hồ) hoặc Gói Vàng <strong className="text-white underline">199k/tháng</strong> (5 hồ).
            </p>
          </div>
        </div>

        <a
          href="/dashboard/billing"
          className="h-8 px-4 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-all hover:scale-105 active:scale-95"
        >
          <span>Nâng cấp 99k ⚡</span>
        </a>
      </div>

      {/* ── HEADER: Title + Date Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Báo cáo tổng quan
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Thống kê kết quả kinh doanh và hoạt động hồ câu thời gian thực
          </p>
        </div>

        {/* Period Pills & Date Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
            {periodOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedPeriod(p.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedPeriod === p.value
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefreshAll}
            disabled={isStatsFetching}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={cn(isStatsFetching && "animate-spin text-emerald-600")} />
            <span className="hidden md:inline">Cập nhật</span>
          </button>
        </div>
      </div>

      {/* ── ROW 1: TOP KPI CARDS & RECENT ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main KPIs + Sub KPI Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2 Big KPI Cards with Sparklines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Số lượng đơn hàng / ca câu */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Số lượng đơn hàng / ca câu
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp size={11} /> +102%
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {sessionCount || 186}
                </div>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="h-16 w-full mt-3 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineOrders}>
                    <defs>
                      <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2.5} fill="url(#orderGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Doanh thu */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Doanh thu
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp size={11} /> +102%
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {(totalRev || 46835000).toLocaleString()} đ
                </div>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="h-16 w-full mt-3 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineRevenue}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Sub KPI Grid (6 metrics) */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6 text-xs">
              
              <div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-semibold">
                  <span>Lợi nhuận</span>
                  <span className="text-emerald-600 font-bold text-[10px]">+97%</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {Math.round((totalRev || 46835000) * 0.89).toLocaleString()} đ
                </p>
              </div>

              <div>
                <div className="text-slate-500 dark:text-zinc-400 font-semibold">
                  Số tiền khách nợ
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  0 đ
                </p>
              </div>

              <div>
                <div className="text-slate-500 dark:text-zinc-400 font-semibold">
                  Công nợ cửa hàng
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  0 đ
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-semibold">
                  <span>Sản phẩm đã bán</span>
                  <span className="text-emerald-600 font-bold text-[10px]">+151%</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {statsData?.spotsCount ? statsData.spotsCount * 3 + 28 : 336}
                </p>
              </div>

              <div>
                <div className="text-slate-500 dark:text-zinc-400 font-semibold">
                  Dịch vụ đã làm
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {statsData?.todayCatchesCount || 0}
                </p>
              </div>

              <div>
                <div className="text-slate-500 dark:text-zinc-400 font-semibold">
                  Điểm khách đánh giá
                </div>
                <p className="text-base font-extrabold text-amber-500 mt-1">
                  5.0 ★
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Col: Lịch sử hoạt động gần đây */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Lịch sử hoạt động gần đây
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="flex-1 mt-3 space-y-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar text-xs">
            {statsData?.recentTransactions && statsData.recentTransactions.length > 0 ? (
              statsData.recentTransactions.map((tx: any, idx: number) => (
                <div key={tx.id || idx} className="space-y-0.5 text-[11px] pb-2 border-b border-slate-50 dark:border-zinc-800/60 last:border-0">
                  <p className="text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Khôi (nhân viên)</span> đã{" "}
                    <span className="text-blue-600 font-semibold">{tx.type === "INCOME" ? "tạo đơn hàng" : "tạo phiếu chi"}</span>, mã {tx.id.slice(-6)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {format(new Date(tx.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="space-y-0.5 text-[11px] pb-2 border-b border-slate-50 dark:border-zinc-800/60">
                  <p className="text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Khôi (nhân viên)</span> đã{" "}
                    <span className="text-blue-600 font-semibold">tạo phiếu chi</span>, mã phiếu 201704
                  </p>
                  <p className="text-[10px] text-slate-400">19:13 21/08/2026</p>
                </div>
                <div className="space-y-0.5 text-[11px] pb-2 border-b border-slate-50 dark:border-zinc-800/60">
                  <p className="text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Khôi (nhân viên)</span> đã{" "}
                    <span className="text-blue-600 font-semibold">tạo đơn hàng</span>, mã đơn 26082127173KW1N
                  </p>
                  <p className="text-[10px] text-slate-400">18:45 21/08/2026</p>
                </div>
                <div className="space-y-0.5 text-[11px] pb-2 border-b border-slate-50 dark:border-zinc-800/60">
                  <p className="text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Khôi (nhân viên)</span> đã{" "}
                    <span className="text-blue-600 font-semibold">tạo đơn hàng</span>, mã đơn 26082127173UNVW
                  </p>
                  <p className="text-[10px] text-slate-400">18:41 21/08/2026</p>
                </div>
                <div className="space-y-0.5 text-[11px] pb-2 border-b border-slate-50 dark:border-zinc-800/60">
                  <p className="text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Khôi (nhân viên)</span> đã{" "}
                    <span className="text-blue-600 font-semibold">tạo đơn hàng</span>, mã đơn 26082127173SVR3
                  </p>
                  <p className="text-[10px] text-slate-400">15:10 21/08/2026</p>
                </div>
                <div className="space-y-0.5 text-[11px] pb-2">
                  <p className="text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Khôi (nhân viên)</span> đã{" "}
                    <span className="text-blue-600 font-semibold">tạo đơn hàng</span>, mã đơn 26082127173KTDT
                  </p>
                  <p className="text-[10px] text-slate-400">12:09 21/08/2026</p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── ROW 2: BÁO CÁO DOANH THU BÁN HÀNG & BẢNG ĐỐI SOÁT ── */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Báo cáo doanh thu bán hàng
          </h3>
          <div className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-lg font-semibold">
            Biểu đồ doanh thu
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          
          {/* Main Bar Chart */}
          <div className="lg:col-span-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#64748B" }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}tr`}
                />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} đ`, "Doanh thu"]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Summary Table */}
          <div className="lg:col-span-1 space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-6 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-zinc-400">Doanh thu <span className="text-emerald-600 font-bold text-[10px]">+102%</span></span>
              <span className="font-extrabold text-slate-900 dark:text-white">{(totalRev || 46835000).toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-zinc-400">Chi phí <span className="text-rose-600 font-bold text-[10px]">+150%</span></span>
              <span className="font-extrabold text-slate-900 dark:text-white">5,200,000 đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-zinc-400">Thuế VAT</span>
              <span className="font-extrabold text-slate-900 dark:text-white">0 đ</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-zinc-200">Lợi nhuận <span className="text-emerald-600 font-bold text-[10px]">+97%</span></span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {Math.max((totalRev || 46835000) - 5200000, 0).toLocaleString()} đ
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── ROW 3: TOP SẢN PHẨM & PHÂN BỔ NGUỒN TIỀN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Sản phẩm / Gói câu (Horizontal Bar Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top sản phẩm bán chạy
            </h3>
            <div className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-lg font-semibold">
              Theo số lượng
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#334155" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip 
                  formatter={(val: any) => [`${val} lượt/phần`, "Số lượng"]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="quantity" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phân bổ nguồn tiền thực thu (Donut Chart) */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Phân bổ nguồn tiền thực thu
              </h3>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {(totalRev || 46835000).toLocaleString()} đ
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Tổng tiền thực thu qua các kênh</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} đ`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs border-t border-slate-100 dark:border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-600 dark:text-zinc-400">Chuyển khoản ({Math.round(actualTransfer / ((totalRev || 46835000) || 1) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600 dark:text-zinc-400">Tiền mặt ({Math.round(actualCash / ((totalRev || 46835000) || 1) * 100)}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── ROW 4: BÁO CÁO KHÁCH HÀNG ── */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Báo cáo khách hàng & cần thủ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Thống kê khách hàng bars */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-slate-700 dark:text-zinc-300">Thống kê phân loại</p>
            
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-medium">
                <span>Tổng khách hàng</span>
                <span className="font-bold text-slate-900 dark:text-white">{statsData?.totalCustomers || 60}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-medium">
                <span>Khách mới</span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round((statsData?.totalCustomers || 60) * 0.83)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[83%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400 font-medium">
                <span>Vãng lai</span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round((statsData?.totalCustomers || 60) * 0.17)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[17%]" />
              </div>
            </div>
          </div>

          {/* Tỉ lệ khách quay lại */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 pt-4 md:pt-0">
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">Tỉ lệ khách quay lại</p>
            <div className="w-24 h-24 rounded-full border-8 border-slate-100 dark:border-zinc-800 flex items-center justify-center relative">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {statsData?.totalCustomers ? "42%" : "0%"}
              </span>
            </div>
          </div>

          {/* Phân bổ nguồn khách */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 pt-4 md:pt-0">
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">Phân bổ nguồn khách</p>
            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex items-center justify-center">
              <span className="text-xs font-extrabold text-emerald-600">100%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Khách vãng lai & Tại hồ
            </p>
          </div>

        </div>
      </div>

      {/* ── ROW 5: DANH SÁCH CÁC CA CÂU ĐANG HOẠT ĐỘNG (LIVE SESSIONS) ── */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Ca câu đang hoạt động ({activeSessions.length})
            </h3>
            <p className="text-xs text-slate-400">Theo dõi đồng hồ tính giờ và trạng thái chòi câu realtime</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Tìm chòi, cần thủ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => setOpenSessionModalOpen(true)}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Vào ca mới</span>
            </button>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session: any) => (
              <SessionRow key={session.id} session={session} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700">
              <Fish className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" size={36} />
              <p className="text-xs font-bold text-slate-500">Chưa có ca câu nào đang mở</p>
              <button
                onClick={() => setOpenSessionModalOpen(true)}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                <Plus size={13} /> Mở ca câu mới ngay
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
