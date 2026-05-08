"use client";

import React from "react";
import { CreditCard, Printer } from "lucide-react";

interface SessionSummaryProps {
  total: number;
  onPrintTicket: () => void;
}

export function SessionSummary({ total, onPrintTicket }: SessionSummaryProps) {
  return (
    <div className="glass p-6 rounded-[2rem] border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tổng cộng tạm tính</p>
        <p className="text-3xl font-black text-primary tracking-tighter">{total.toLocaleString()}đ</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 pt-2">
        <button
          type="button"
          onClick={onPrintTicket}
          className="h-14 w-full bg-accent text-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 border border-border/50 hover:bg-accent/80 transition-all active:scale-95"
        >
          <Printer size={18} />
          In phiếu bắt đầu
        </button>
      </div>
    </div>
  );
}
