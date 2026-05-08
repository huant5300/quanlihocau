"use client";

import React from "react";
import { Fish, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BuybackSummaryProps {
  fishLabel: string;
  weight: number;
  pricePerKg: number;
  total: number;
}

export function BuybackSummary({ fishLabel, weight, pricePerKg, total }: BuybackSummaryProps) {
  return (
    <div className="glass p-6 rounded-[2.5rem] border-orange-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
            <Fish size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Chi tiết thu mua</p>
            <p className="font-black text-sm uppercase tracking-tight">{fishLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Đơn giá</p>
          <p className="font-bold text-xs">{pricePerKg.toLocaleString()}đ/kg</p>
        </div>
      </div>

      <div className="flex items-end justify-between bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Số lượng</p>
          <p className="text-2xl font-black">{weight.toFixed(1)} <span className="text-sm">KG</span></p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center justify-end gap-1">
            <ArrowDownRight size={12} /> Khấu trừ
          </p>
          <motion.p 
            key={total}
            initial={{ scale: 1.1, color: "#f97316" }}
            animate={{ scale: 1, color: "#f97316" }}
            className="text-3xl font-black tracking-tighter"
          >
            -{total.toLocaleString()}đ
          </motion.p>
        </div>
      </div>
    </div>
  );
}
