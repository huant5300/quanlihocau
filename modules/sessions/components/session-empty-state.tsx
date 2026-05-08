"use client";

import React from "react";
import { Waves, Plus } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function SessionEmptyState() {
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass-card rounded-[3rem] border-dashed border-border/50">
      <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-muted-foreground mb-6">
        <Waves size={40} />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight">Chưa có lượt câu nào</h3>
      <p className="text-sm text-muted-foreground font-bold mt-2 max-w-[250px]">
        Hiện không có khách nào đang câu. Hãy mở lượt mới để bắt đầu.
      </p>
      <button
        onClick={() => setOpenSessionModalOpen(true)}
        className="mt-8 h-14 px-8 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={20} strokeWidth={3} />
        <span>Bắt đầu ngay</span>
      </button>
    </div>
  );
}
