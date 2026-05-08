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

const data = [
  { name: "Thứ 2", revenue: 4000000, sessions: 12 },
  { name: "Thứ 3", revenue: 3000000, sessions: 10 },
  { name: "Thứ 4", revenue: 2000000, sessions: 8 },
  { name: "Thứ 5", revenue: 2780000, sessions: 11 },
  { name: "Thứ 6", revenue: 1890000, sessions: 9 },
  { name: "Thứ 7", revenue: 6390000, sessions: 22 },
  { name: "CN", revenue: 8490000, sessions: 35 },
];

export function RevenueChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor", opacity: 0.5 }}
            tickFormatter={(value) => `${value / 1000000}M`}
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
