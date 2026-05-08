"use client";

import React from "react";
import { Phone, Calendar, ArrowRight, Wallet } from "lucide-react";
import { cn } from "@/utils/utils";
import { Customer } from "../types/crm.types";
import { MembershipBadge } from "./membership-badge";
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
            {customer.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight uppercase group-hover:text-primary transition-colors">
              {customer.fullName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Phone size={12} />
              <p className="text-xs font-bold">{customer.phoneNumber}</p>
            </div>
          </div>
        </div>
        <MembershipBadge level={customer.membershipLevel} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet size={12} />
            <p className="text-[10px] font-black uppercase tracking-widest">Tổng chi</p>
          </div>
          <p className="font-black text-sm">{customer.totalSpending.toLocaleString()}đ</p>
        </div>
        <div className="bg-accent/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar size={12} />
            <p className="text-[10px] font-black uppercase tracking-widest">Lượt câu</p>
          </div>
          <p className="font-black text-sm">{customer.totalSessions} Lần</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lần cuối ghé</span>
          <span className="text-xs font-bold mt-0.5">{customer.lastVisit}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowRight size={18} />
        </div>
      </div>
    </motion.div>
  );
}
