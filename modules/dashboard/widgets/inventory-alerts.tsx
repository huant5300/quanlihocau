"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { AlertCircle, Package } from "lucide-react";
import { cn } from "@/utils/utils";

const LOW_STOCK = [
  { name: "Mồi Cám Xanh", stock: 5, unit: "gói" },
  { name: "Nước Suối 500ml", stock: 12, unit: "chai" },
  { name: "Mồi Giun Đỏ", stock: 2, unit: "hộp" },
];

export function InventoryAlerts() {
  return (
    <DashboardWidget 
      title="Cảnh báo kho hàng" 
      subtitle="3 mặt hàng sắp hết"
      icon={Package}
    >
      <div className="space-y-4">
        {LOW_STOCK.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
              <p className="text-xs font-bold">{item.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-red-500">{item.stock}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.unit}</p>
            </div>
          </div>
        ))}

        <button className="w-full h-12 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
          Nhập thêm hàng
        </button>
      </div>
    </DashboardWidget>
  );
}
