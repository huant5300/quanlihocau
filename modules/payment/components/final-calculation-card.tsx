"use client";

import React from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FinalCalculationCardProps {
  subtotal: number;
  discount?: number;
  total: number;
}

export function FinalCalculationCard({ subtotal, discount = 0, total }: FinalCalculationCardProps) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border-primary/20 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Calculator size={120} />
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[10px] font-black uppercase tracking-widest">Tổng cộng</span>
          <span className="font-bold">{subtotal.toLocaleString()}đ</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Giảm giá hội viên</span>
            <span className="font-bold">-{discount.toLocaleString()}đ</span>
          </div>
        )}
        <div className="h-px bg-border/50 my-4" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Phải thanh toán</span>
          <motion.h2 
            key={total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black text-primary tracking-tighter"
          >
            {total.toLocaleString()}đ
          </motion.h2>
        </div>
      </div>
    </div>
  );
}
