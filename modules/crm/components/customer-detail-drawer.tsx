"use client";

import React from "react";
import { 
  X, 
  User, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Fish, 
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Customer } from "./customer-table";
import { cn } from "@/utils/utils";

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, isOpen, onClose }: CustomerDetailDrawerProps) {
  if (!customer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-xl bg-card h-full shadow-2xl border-l flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{customer.full_name}</h2>
                  <p className="text-muted-foreground font-medium">{customer.phone_number}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-accent rounded-2xl transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <QuickStat label="Tổng chi" value={`${customer.total_spent.toLocaleString()}đ`} icon={<TrendingUp size={14} />} />
              <QuickStat label="Lượt câu" value={customer.total_visits} icon={<Calendar size={14} />} />
              <QuickStat label="Hạng" value={customer.is_vip ? "VIP" : "Thường"} icon={<User size={14} />} highlight={customer.is_vip} />
            </div>
          </div>

          {/* History Sections */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
            {/* Recent Sessions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Lịch sử lượt câu</h3>
                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Tất cả <ExternalLink size={12} />
                </button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 rounded-3xl border bg-accent/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Clock size={16} className="text-primary" />
                        <span>08/05/2026 • 08:30 - 12:30</span>
                      </div>
                      <span className="text-xs font-black text-primary">245.000đ</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                        <Fish size={14} /> 5kg cá (Hắc trắm)
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                        <ShoppingBag size={14} /> 2 Dịch vụ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty / Spending Summary */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tóm tắt chi tiêu</h3>
              <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Điểm tích lũy</span>
                  <span className="text-xl font-black text-primary">1,240 pts</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-primary" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cần thêm 760 điểm để thăng hạng VIP Kim Cương</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 border-t bg-muted/30 grid grid-cols-2 gap-4">
            <button className="h-14 bg-accent rounded-2xl font-bold hover:bg-accent/80 transition-all">Sửa thông tin</button>
            <button className="h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Mở lượt câu</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function QuickStat({ label, value, icon, highlight = false }: { label: string; value: string | number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="bg-background border p-3 rounded-2xl space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <p className={cn("text-sm font-black truncate", highlight && "text-yellow-600")}>{value}</p>
    </div>
  );
}
