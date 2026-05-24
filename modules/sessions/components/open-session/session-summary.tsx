"use client";

import React from "react";

interface SessionSummaryProps {
  total: number;
  prepaid: number;
}

export function SessionSummary({ total, prepaid }: SessionSummaryProps) {
  const remaining = total - prepaid;
  
  return (
    <div className="bg-slate-100 dark:bg-zinc-800 p-6 rounded-[2rem] border-2 border-slate-300 dark:border-zinc-700 space-y-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <p className="text-xs font-black uppercase tracking-widest">Tổng cộng dự kiến</p>
          <p className="text-base font-black">{total.toLocaleString()}đ</p>
        </div>
        <div className="flex items-center justify-between text-orange-700 dark:text-orange-400">
          <p className="text-xs font-black uppercase tracking-widest">Đã tạm thu</p>
          <p className="text-base font-black">-{prepaid.toLocaleString()}đ</p>
        </div>
        <div className="pt-3 border-t-2 border-slate-250 dark:border-zinc-700 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-widest text-primary dark:text-primary-foreground">Còn lại cần thu</p>
          <p className="text-3xl font-black text-primary dark:text-primary-foreground tracking-tighter animate-pulse">
            {remaining.toLocaleString()}đ
          </p>
        </div>
      </div>
    </div>
  );
}
