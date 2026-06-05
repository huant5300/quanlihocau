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
import { Crown, Trophy } from "lucide-react";

export function ReportsClient({ revenueChartData, topProducts, topCatcher, biggestCatch }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="glass-card p-8 rounded-[3rem]">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8">Doanh thu 30 ngày qua</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
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
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'black' }}
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
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card p-8 rounded-[3rem]">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8">Sản phẩm bán chạy</h3>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">Sản phẩm</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12 text-center">Số lượng</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12 text-right">Tổng thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p: any, i: number) => (
                <TableRow key={i} className="hover:bg-white/5 border-white/5">
                  <TableCell className="py-4 font-bold text-sm">{p.description}</TableCell>
                  <TableCell className="text-center font-bold">{p._sum.quantity}</TableCell>
                  <TableCell className="text-right font-black text-primary">{Number(p._sum.totalPrice).toLocaleString()}đ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Cần thủ xuất sắc & Kỷ lục câu cá */}
      <div className="glass-card p-8 rounded-[3rem]">
        <h3 className="text-lg font-black uppercase tracking-tight mb-8">Kỷ lục câu cá & Cần thủ xuất sắc (30 ngày qua)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cần thủ câu nhiều nhất */}
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-primary/5 -mr-8 -mt-8 opacity-50" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Crown size={24} className="stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cần thủ câu nhiều cá nhất</p>
                {topCatcher ? (
                  <div>
                    <h4 className="text-lg font-black text-white">{topCatcher.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{topCatcher.phone}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full text-xs font-black uppercase tracking-wider">
                      Đã câu: {topCatcher.count} con cá
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground italic mt-1">Chưa ghi nhận lượt thu mua cá nào trong tháng qua</p>
                )}
              </div>
            </div>
          </div>

          {/* Kỷ lục cá lớn nhất */}
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-primary/5 -mr-8 -mt-8 opacity-50" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Trophy size={24} className="stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kỷ lục cá lớn nhất câu được</p>
                {biggestCatch ? (
                  <div>
                    <h4 className="text-lg font-black text-white">{biggestCatch.customerName}</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{biggestCatch.customerPhone}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black uppercase tracking-wider">
                        {biggestCatch.fishName}: {biggestCatch.weight} kg
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-full text-xs font-black uppercase tracking-wider">
                        Thu mua: {Number(biggestCatch.amount).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground italic mt-1">Chưa ghi nhận kỷ lục câu cá nào trong tháng qua</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
