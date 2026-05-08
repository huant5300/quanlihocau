"use client";

import React from "react";
import { 
  X, 
  Wallet, 
  Waves, 
  Fish, 
  History,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Customer } from "../types/crm.types";
import { MembershipBadge } from "./membership-badge";

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, isOpen, onClose }: CustomerDetailDrawerProps) {
  if (!customer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end p-0 sm:p-0">
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
            className="relative w-full max-w-xl h-full bg-background shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-primary/30">
                  {customer.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{customer.fullName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <MembershipBadge level={customer.membershipLevel} />
                    <span className="text-xs font-bold text-muted-foreground">{customer.phoneNumber}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center hover:bg-muted transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              {/* Spending Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-[2rem] space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Tổng chi tiêu</p>
                  </div>
                  <h4 className="text-2xl font-black text-primary tracking-tighter">
                    {customer.totalSpending.toLocaleString()}đ
                  </h4>
                </div>
                <div className="glass-card p-6 rounded-[2rem] space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Waves size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Tần suất ghé</p>
                  </div>
                  <h4 className="text-2xl font-black tracking-tighter">
                    {customer.totalSessions} <span className="text-sm">phiên</span>
                  </h4>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <History size={14} /> Hoạt động gần đây
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < 3 && <div className="absolute left-6 top-12 bottom-0 w-px bg-border/50" />}
                      <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0 border border-border/50">
                        {i === 1 ? <CreditCard size={20} className="text-primary" /> : <Fish size={20} className="text-orange-500" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-sm">{i === 1 ? "Thanh toán phiên câu #882" : "Khấu trừ thu mua cá"}</p>
                          <span className="text-[10px] font-bold text-muted-foreground">2 ngày trước</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Chi tiết giao dịch: {i === 1 ? "450,000đ" : "-85,000đ"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Sở thích cá nhân</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Fish size={14} /> Trắm Đen
                  </div>
                  <div className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Waves size={14} /> Gói 6h
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-border/50 bg-card/80 backdrop-blur-md grid grid-cols-2 gap-4">
              <button className="h-16 rounded-2xl bg-accent font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all active:scale-95">
                Nhắn tin
              </button>
              <button className="h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                Tạo lượt câu mới
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
