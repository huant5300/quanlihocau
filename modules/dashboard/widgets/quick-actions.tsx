"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { Plus, ShoppingBag, Fish, UserPlus, Zap } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function QuickActions() {
  const { setOpenSessionModalOpen } = useUIStore();

  const actions = [
    { label: "Mở lượt mới", icon: Plus, color: "bg-primary shadow-primary/20", onClick: () => setOpenSessionModalOpen(true) },
    { label: "Bán hàng", icon: ShoppingBag, color: "bg-blue-500 shadow-blue-500/20", onClick: () => {} },
    { label: "Thu mua cá", icon: Fish, color: "bg-orange-500 shadow-orange-500/20", onClick: () => {} },
    { label: "Thêm khách", icon: UserPlus, color: "bg-purple-500 shadow-purple-500/20", onClick: () => {} },
  ];

  return (
    <DashboardWidget 
      title="Thao tác nhanh" 
      subtitle="Phím tắt POS chuyên dụng"
      icon={Zap}
    >
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group flex flex-col items-center gap-3 p-5 bg-accent/30 rounded-3xl hover:bg-accent transition-all active:scale-95 border border-transparent hover:border-white/5"
          >
            <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110`}>
              <action.icon size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </DashboardWidget>
  );
}
