"use client";

import React, { useEffect, useState } from "react";
import { DashboardWidget } from "./dashboard-widget";
import { DollarSign, TrendingUp } from "lucide-react";

interface RevenueSummaryProps {
  initialRevenue: number;
  sessionRevenue?: number;
  productRevenue?: number;
}

export function RevenueSummary({ initialRevenue, sessionRevenue = 0, productRevenue = 0 }: RevenueSummaryProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-40 bg-accent/10 animate-pulse rounded-[2.5rem]" />;

  const formattedRevenue = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(initialRevenue);

  return (
    <DashboardWidget 
      title="Doanh thu hôm nay" 
      subtitle={mounted ? `Cập nhật lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "Đang cập nhật..."}
      icon={DollarSign}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground">
            {formattedRevenue}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">
              <TrendingUp size={12} />
              +0%
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">So với hôm qua</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-accent/30 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tiền câu</p>
            <p className="font-black text-sm mt-1">{sessionRevenue.toLocaleString()}đ</p>
          </div>
          <div className="p-4 bg-accent/30 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Dịch vụ</p>
            <p className="font-black text-sm mt-1">{productRevenue.toLocaleString()}đ</p>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}
