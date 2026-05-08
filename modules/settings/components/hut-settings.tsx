"use client";

import React from "react";
import { SettingsCard } from "./settings-card";
import { MapPin, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/utils/utils";

const MOCK_HUTS = [
  { id: "1", number: "01", status: "Available", capacity: 4 },
  { id: "2", number: "02", status: "Occupied", capacity: 2 },
  { id: "3", number: "03", status: "Maintenance", capacity: 4 },
];

export function HutSettings() {
  return (
    <SettingsCard 
      title="Quản lý Chòi" 
      description="Quản lý danh sách các chòi và vị trí câu."
      icon={MapPin}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {MOCK_HUTS.map((hut) => (
          <div key={hut.id} className="p-4 bg-accent/30 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
              hut.status === "Available" ? "bg-green-500 text-white" : 
              hut.status === "Maintenance" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
            )}>
              <span className="font-black text-lg">{hut.number}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{hut.status}</p>
              <p className="text-xs font-bold mt-1">Sức chứa: {hut.capacity}</p>
            </div>
          </div>
        ))}

        <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2">
          <Plus size={20} className="text-muted-foreground" />
          <span className="text-[8px] font-black uppercase tracking-widest">Thêm chòi</span>
        </button>
      </div>
    </SettingsCard>
  );
}
