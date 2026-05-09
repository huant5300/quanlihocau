"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/supabase/report-service";
import { motion } from "framer-motion";

export function RevenueChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: () => reportService.getMonthlyRevenue(),
  });

  // Format data for Recharts
  const chartData = (rawData || []).map(item => ({
    name: item.month, // YYYY-MM
    revenue: Number(item.revenue),
    count: item.payment_count
  }));

  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
          />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor", opacity: 0.5 }}
            dy={10}
            tickFormatter={(value) => {
              const [year, month] = value.split("-");
              return `Tháng ${month}/${year.slice(2)}`;
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor", opacity: 0.5 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? "#0f172a" : "#fff", 
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
              fontWeight: 900,
              fontSize: "12px"
            }}
            formatter={(value: number) => [
              new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
              "Doanh thu"
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorRev)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
