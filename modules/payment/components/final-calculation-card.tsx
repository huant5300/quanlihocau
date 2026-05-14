"use client";

import React from "react";
import { Calculator } from "lucide-react";
import { motion } from "framer-motion";

interface FinalCalculationCardProps {
  subtotal: number; // Session + Products
  buybackDeduction?: number;
  prepaidAmount?: number;
  total: number; // Remaining balance
}

export function FinalCalculationCard({ 
  subtotal, 
  buybackDeduction = 0, 
  prepaidAmount = 0,
  total 
}: FinalCalculationCardProps) {
  const finalBalance = total - prepaidAmount;

  return (
    <div className="glass p-8 rounded-[2.5rem] border-primary/20 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Calculator size={120} />
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[10px] font-black uppercase tracking-widest">Tổng cộng (Giờ + Đồ)</span>
          <span className="font-bold">{subtotal.toLocaleString()}đ</span>
        </div>
        
        {buybackDeduction > 0 && (
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Tiền thu cá (Khấu trừ)</span>
            <span className="font-bold">-{buybackDeduction.toLocaleString()}đ</span>
          </div>
        )}

        {prepaidAmount > 0 && (
          <div className="flex items-center justify-between text-orange-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Đã tạm thu</span>
            <span className="font-bold">-{prepaidAmount.toLocaleString()}đ</span>
          </div>
        )}

        <div className="h-px bg-border/50 my-4" />
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              {finalBalance >= 0 ? "Còn lại cần thu" : "Tiền thối lại cho khách"}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground italic">
              * Tự động tính toán theo nghiệp vụ hồ câu
            </span>
          </div>
          <motion.h2 
            key={finalBalance}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-4xl font-black tracking-tighter ${finalBalance >= 0 ? 'text-primary' : 'text-green-500'}`}
          >
            {Math.abs(finalBalance).toLocaleString()}đ
          </motion.h2>
        </div>
      </div>
    </div>
  );
}
