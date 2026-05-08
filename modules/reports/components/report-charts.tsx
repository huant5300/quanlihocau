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
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const REVENUE_DATA = [
  { name: "01/05", value: 4500000 },
  { name: "02/05", value: 3200000 },
  { name: "03/05", value: 6800000 },
  { name: "04/05", value: 5100000 },
  { name: "05/05", value: 4900000 },
  { name: "06/05", value: 8200000 },
  { name: "07/05", value: 7400000 },
];

const PRODUCT_DATA = [
  { name: "Cám câu", value: 45 },
  { name: "Mồi xả", value: 30 },
  { name: "Đồ uống", value: 15 },
  { name: "Dụng cụ", value: 10 },
];

const COLORS = ["#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={REVENUE_DATA}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            tickFormatter={(value) => `${value / 1000000}M`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
            itemStyle={{ color: "#fff", fontWeight: 700 }}
            cursor={{ stroke: "#0EA5E9", strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0EA5E9" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProductPieChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={PRODUCT_DATA}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {PRODUCT_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "16px" }}
             itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomerTrendChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={REVENUE_DATA}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} 
            dy={10}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "16px" }}
            cursor={{ fill: "rgba(14, 165, 233, 0.1)" }}
          />
          <Bar dataKey="value" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
