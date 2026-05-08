"use client";

import React from "react";
import { SettingsCard } from "./settings-card";
import { Package, Plus, Edit2, Trash2 } from "lucide-react";

const MOCK_PACKAGES = [
  { id: "1", name: "Gói 2 Giờ", duration: 120, price: 150000, isActive: true },
  { id: "2", name: "Gói 4 Giờ", duration: 240, price: 250000, isActive: true },
  { id: "3", name: "Gói Cả Ngày", duration: 720, price: 500000, isActive: true },
];

export function PackageSettings() {
  return (
    <SettingsCard 
      title="Gói Câu cá" 
      description="Cấu hình thời gian và đơn giá các gói dịch vụ."
      icon={Package}
    >
      <div className="space-y-4">
        {MOCK_PACKAGES.map((pkg) => (
          <div key={pkg.id} className="p-5 bg-accent/30 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-accent/50 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-xs">
                {pkg.duration / 60}h
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-tight">{pkg.name}</p>
                <p className="text-xs font-bold text-primary mt-1">{pkg.price.toLocaleString()}đ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button className="p-3 bg-background hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                <Edit2 size={16} />
              </button>
              <button className="p-3 bg-background hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button className="w-full h-16 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all">
          <Plus size={18} />
          Thêm gói mới
        </button>
      </div>
    </SettingsCard>
  );
}
