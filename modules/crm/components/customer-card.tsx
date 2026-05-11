"use client";

import React from "react";
import { Phone, Calendar, ArrowRight, Wallet } from "lucide-react";
import { Customer } from "@/types";
import { motion } from "framer-motion";

interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      onClick={() => onClick?.(customer)}
      className="glass-card p-6 rounded-[2.5rem] flex flex-col gap-6 cursor-pointer group transition-all"
    >
      {/* Header: Name & Phone */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
            {customer.full_name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight uppercase group-hover:text-primary transition-colors">
              {customer.full_name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone size={12} />
                <p className="text-xs font-bold">{customer.phone || "---"}</p>
              </div>
              {(customer as any).debt_balance > 0 && (
                <div className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                  Nợ: {Number((customer as any).debt_balance).toLocaleString()}đ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet size={12} />
            <p className="text-[10px] font-black uppercase tracking-widest">Tổng chi</p>
          </div>
          <p className="font-black text-sm">{(customer.total_spent || 0).toLocaleString()}đ</p>
        </div>
        <div className="bg-accent/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar size={12} />
            <p className="text-[10px] font-black uppercase tracking-widest">Lượt câu</p>
          </div>
          <p className="font-black text-sm">{customer.visit_count || 0} Lần</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tham gia từ</span>
          <span className="text-xs font-bold mt-0.5">{customer.created_at ? new Date(customer.created_at).toLocaleDateString("vi-VN") : "---"}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowRight size={18} />
        </div>
      </div>
    </motion.div>
  );
}
