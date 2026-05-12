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

export function ReportsClient({ revenueChartData, topProducts }: any) {
  return (
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
  );
}
