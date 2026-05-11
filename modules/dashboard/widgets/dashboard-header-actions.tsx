"use client";

import React from "react";
import { Plus, Bell } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function DashboardHeaderActions() {
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="flex items-center gap-3">
      <button className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-accent/80 transition-all active:scale-90 relative">
        <Bell size={24} />
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
      </button>
      <button 
        onClick={() => setOpenSessionModalOpen(true)}
        className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={20} strokeWidth={3} />
        <span className="hidden sm:inline">Mở lượt mới</span>
      </button>
    </div>
  );
}
