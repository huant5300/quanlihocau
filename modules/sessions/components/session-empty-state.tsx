"use client";

import React from "react";
import { Fish, Plus } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function SessionEmptyState() {
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 shadow-2xs">
      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-2xs">
        <Fish size={32} className="stroke-[2]" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
        Chưa có ca câu nào đang mở
      </h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs">
        Hiện không có khách nào đang câu tại các chòi. Hãy mở ca câu mới để bắt đầu tính giờ.
      </p>
      <button
        onClick={() => setOpenSessionModalOpen(true)}
        className="mt-6 h-10 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus size={16} className="stroke-[2.5]" />
        <span>Vào ca câu mới ngay</span>
      </button>
    </div>
  );
}

