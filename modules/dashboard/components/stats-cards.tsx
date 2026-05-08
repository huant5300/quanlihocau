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
      title: "Lượt câu đang hoạt động",
      value: stats?.active_sessions || 0,
      icon: Waves,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "+4",
      trendUp: true,
    },
    {
      title: "Doanh thu hôm nay",
      value: `${(stats?.total_revenue || 0).toLocaleString()}đ`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Khách hàng mới",
      value: stats?.new_customers || 0,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: "+2",
      trendUp: true,
    },
    {
      title: "Cảnh báo hệ thống",
      value: stats?.active_alerts || 0,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      trend: "0",
      trendUp: false,
    },
  ];

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card p-4 md:p-6 rounded-3xl border border-border/50 hover:border-primary/20 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-2xl", card.bg, card.color)}>
              <card.icon size={24} />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
              card.trendUp ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
            )}>
              {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.trend}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <h3 className="text-xl md:text-2xl font-black mt-1 group-hover:text-primary transition-colors">
              {card.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
