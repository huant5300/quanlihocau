"use client";

import React from "react";
import { 
  ShoppingBag, 
  Plus, 
  Clock, 
  RotateCcw, 
  CreditCard,
  User,
  Phone
} from "lucide-react";
import { cn } from "@/utils/utils";
import { FishingSession } from "../types/session.types";
import { CountdownTimer } from "./countdown-timer";
import { SessionStatusBadge } from "./session-status-badge";
import { motion } from "framer-motion";

interface SessionCardProps {
  session: FishingSession;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-card p-6 rounded-[2.5rem] flex flex-col gap-6 group transition-all",
        session.status === "WARNING" && "border-orange-500/30 bg-orange-500/5"
      )}
    >
      {/* Header: Hut & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <span className="font-black text-2xl tracking-tighter">{session.hut_number}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" />
              <p className="font-black text-sm tracking-tight uppercase">{session.customer_name}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Phone size={12} className="text-muted-foreground" />
              <p className="text-[11px] font-bold text-muted-foreground">{session.phone}</p>
            </div>
          </div>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      {/* Timer & Info */}
      <div className="bg-background/50 rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thời gian còn lại</p>
          <CountdownTimer endTime={session.end_time} />
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{session.products?.length || 0} Sản phẩm</span>
          </div>
          <p className="text-xl font-black text-primary tracking-tight">
            {session.total_amount.toLocaleString()}đ
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button className="h-12 bg-accent/50 hover:bg-accent rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
          <Plus size={16} /> Thêm đồ
        </button>
        <button className="h-12 bg-accent/50 hover:bg-accent rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
          <Clock size={16} /> Gia hạn
        </button>
        <button className="h-12 bg-accent/50 hover:bg-accent rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
          <RotateCcw size={16} /> Thu cá
        </button>
        <button className="h-12 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
          <CreditCard size={16} /> Thanh toán
        </button>
      </div>
    </motion.div>
  );
}
