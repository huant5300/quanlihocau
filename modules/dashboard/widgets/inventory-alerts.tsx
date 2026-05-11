"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { AlertCircle, Package } from "lucide-react";
import Link from "next/link";

interface InventoryAlertsProps {
  count: number;
}

export function InventoryAlerts({ count }: InventoryAlertsProps) {
  return (
    <DashboardWidget 
      title="Cảnh báo kho hàng" 
      subtitle={count > 0 ? `${count} mặt hàng sắp hết` : "Kho hàng ổn định"}
      icon={Package}
    >
      <div className="space-y-4">
        <div className={`p-8 rounded-[2rem] flex flex-col items-center justify-center text-center ${count > 0 ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"}`}>
          <div className="w-16 h-16 rounded-3xl bg-white/50 dark:bg-black/20 flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Sắp hết hàng</p>
          <h4 className="text-5xl font-black mt-2">{count}</h4>
        </div>

        <Link 
          href="/dashboard/products"
          className="w-full h-14 bg-accent/50 hover:bg-accent rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Nhập thêm hàng
        </Link>
      </div>
    </DashboardWidget>
  );
}
