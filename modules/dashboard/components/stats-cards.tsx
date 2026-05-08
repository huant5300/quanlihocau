"use client";

import React from "react";
import { 
  Waves, 
  DollarSign, 
  Users, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardStats } from "@/types/dashboard";
import { cn } from "@/utils/utils";

interface StatsCardsProps {
  stats?: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Lượt câu",
      subtitle: "Đang hoạt động",
      value: stats?.active_sessions || 0,
      icon: Waves,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "+4",
      trendUp: true,
    },
    {
      title: "Doanh thu",
      subtitle: "Hôm nay",
      value: `${(stats?.total_revenue || 0).toLocaleString()}đ`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Khách hàng",
      subtitle: "Mới hôm nay",
      value: stats?.new_customers || 0,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: "+2",
      trendUp: true,
    },
    {
      title: "Hệ thống",
      subtitle: "Cảnh báo",
      value: stats?.active_alerts || 0,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      trend: "0",
      trendUp: false,
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-8 rounded-[2.5rem] group hover:scale-[1.02] transition-all cursor-default"
        >
          <div className="flex items-center justify-between mb-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", card.bg, card.color)}>
              <card.icon size={28} strokeWidth={2.5} />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
              card.trendUp ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
            )}>
              {card.trendUp && <TrendingUp size={12} />}
              {card.trend}
            </div>
          </div>
          <div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{card.title}</p>
              <p className="text-xs font-bold text-muted-foreground/60">{card.subtitle}</p>
            </div>
            <h3 className="text-3xl font-black mt-4 tracking-tight group-hover:text-primary transition-colors">
              {card.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
