"use client";

import React from "react";

interface SessionSummaryProps {
  total: number;
  prepaid: number;
}

export function SessionSummary({ total, prepaid }: SessionSummaryProps) {
  const remaining = total - prepaid;
  
  return (
    <div className="glass p-6 rounded-[2rem] border-primary/20 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <p className="text-[10px] font-black uppercase tracking-widest">Tổng cộng dự kiến</p>
          <p className="text-sm font-bold">{total.toLocaleString()}đ</p>
        </div>
        <div className="flex items-center justify-between text-orange-500">
          <p className="text-[10px] font-black uppercase tracking-widest">Đã tạm thu</p>
          <p className="text-sm font-bold">-{prepaid.toLocaleString()}đ</p>
        </div>
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Còn lại cần thu</p>
          <p className="text-2xl font-black text-primary tracking-tighter">
            {remaining.toLocaleString()}đ
          </p>
        </div>
      </div>
    </div>
  );
}
