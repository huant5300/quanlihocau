"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Crown, Trophy, FileDown, TrendingUp } from "lucide-react";
import { exportToExcel } from "@/utils/export-excel";
import { exportToPDF } from "@/utils/export-pdf";
import { toast } from "sonner";

export function ReportsClient({ revenueChartData, topProducts, topCatcher, biggestCatch }: any) {
  const handleExportExcel = () => {
    if (!revenueChartData || revenueChartData.length === 0) return toast.error("Không có dữ liệu để xuất");
    const revenueData = revenueChartData.map((r: any) => ({
      "Ngày": r.date,
      "Doanh thu (VNĐ)": r.amount
    }));
    exportToExcel(revenueData, `bao_cao_doanh_thu`);
    toast.success("Xuất báo cáo doanh thu thành công");
  };

  const handleExportPDF = () => {
    if (!revenueChartData || revenueChartData.length === 0) return toast.error("Không có dữ liệu để xuất");
    const headers = ["Ngày", "Doanh thu"];
    const rows = revenueChartData.map((r: any) => [
      r.date, Number(r.amount).toLocaleString() + "đ"
    ]);
    exportToPDF({
      title: "Báo Cáo Doanh Thu 30 Ngày Qua",
      headers,
      rows,
      filename: "bao_cao_doanh_thu"
    });
    toast.success("Xuất PDF thành công");
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ── HEADER TITLE ── */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Báo cáo bán hàng & Doanh thu
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Tổng hợp dữ liệu kinh doanh 30 ngày qua và xếp hạng kỷ lục cần thủ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportExcel}
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileDown size={14} />
            <span>Xuất Excel</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileDown size={14} />
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* ── CHARTS ROW: Revenue Area Chart & Top Products Table ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Revenue Chart Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Doanh thu 30 ngày qua
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Doanh thu thực tế
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorAmountReport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}tr`}
                />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} đ`, "Doanh thu"]}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorAmountReport)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sản phẩm & Gói dịch vụ bán chạy
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Theo tổng doanh thu</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 dark:bg-zinc-800/60 hover:bg-slate-50/80 border-b border-slate-100 dark:border-zinc-800">
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400 h-10">Sản phẩm / Dịch vụ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400 h-10 text-center">Số lượng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 dark:text-zinc-400 h-10 text-right">Tổng thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((p: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800/60">
                      <TableCell className="py-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">{p.description}</TableCell>
                      <TableCell className="text-center text-xs font-bold text-slate-900 dark:text-white">{p._sum.quantity}</TableCell>
                      <TableCell className="text-right text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{Number(p._sum.totalPrice).toLocaleString()} đ</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-400">
                      Chưa có dữ liệu bán hàng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>

      {/* ── RECORDS & AWARDS ROW ── */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Kỷ lục câu cá & Cần thủ xuất sắc (30 ngày qua)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Top Catcher */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
              <Crown size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cần thủ câu nhiều cá nhất</p>
              {topCatcher ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{topCatcher.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{topCatcher.phone}</p>
                  <span className="mt-2 inline-block px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-md text-[11px] font-bold">
                    Đã câu: {topCatcher.count} con cá
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa ghi nhận dữ liệu</p>
              )}
            </div>
          </div>

          {/* Biggest Catch */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Trophy size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kỷ lục cá to nhất</p>
              {biggestCatch ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {biggestCatch.fishName} - {biggestCatch.weight} kg
                  </h4>
                  <p className="text-xs text-slate-500">{biggestCatch.catcherName}</p>
                  <span className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md text-[11px] font-bold">
                    Cân nặng: {biggestCatch.weight} kg
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa ghi nhận kỷ lục cá khủng</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
