"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Waves, 
  Users, 
  Fish 
} from "lucide-react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

import { DashboardStats } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";

export function StatsGrid() {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => sessionService.getStats(),
  });

  const statsList = [
    { 
      label: "Doanh thu hôm nay", 
      value: isLoading ? "..." : `${(dashboardStats?.todayRevenue || 0).toLocaleString()}đ`, 
      trend: "+0%", 
      up: true, 
      icon: DollarSign, 
      color: "text-green-500", 
      bg: "bg-green-500/10" 
    },
    { 
      label: "Lượt câu đang mở", 
      value: isLoading ? "..." : (dashboardStats?.activeCount || 0).toString(), 
      trend: "+0%", 
      up: true, 
      icon: Waves, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Tổng hội viên", 
      value: isLoading ? "..." : (dashboardStats?.customerCount || 0).toString(), 
      trend: "+0%", 
      up: true, 
      icon: Users, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10" 
    },
    { 
      label: "Hết hàng (Cảnh báo)", 
      value: isLoading ? "..." : (dashboardStats?.lowStockCount || 0).toString(), 
      trend: "Check", 
      up: false, 
      icon: Fish, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10" 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statsList.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 rounded-[2.5rem] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
              stat.up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {stat.trend}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
            <h4 className="text-2xl font-black mt-1 tracking-tighter">{stat.value}</h4>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
