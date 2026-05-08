"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export function RevenueSummary() {
  return (
    <DashboardWidget 
      title="Doanh thu hôm nay" 
      subtitle="Cập nhật lúc 17:30"
      icon={DollarSign}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground">
            8.450.000đ
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">
              <TrendingUp size={12} />
              +15.4%
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">So với hôm qua</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-accent/30 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tiền câu</p>
            <p className="font-black text-sm mt-1">5.2Mđ</p>
          </div>
          <div className="p-4 bg-accent/30 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Dịch vụ</p>
            <p className="font-black text-sm mt-1">3.25Mđ</p>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}
