"use client";

import React from "react";
import { 
  Phone, 
  Plus, 
  History, 
  Scale, 
  CreditCard, 
  User,
  Hash,
  ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import { CountdownTimer } from "./countdown-timer";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

import { FishingSession } from "@/types/sessions";

interface SessionCardProps {
  session: FishingSession;
}

import { useUIStore } from "@/stores/ui-store";

export function SessionCard({ session }: SessionCardProps) {
  const { setPaymentModalOpen, setActiveSessionForPayment } = useUIStore();

  const handleAction = (label: string) => {
    if (label === "Thanh toán") {
      setActiveSessionForPayment(session);
      setPaymentModalOpen(true);
      return;
    }
    toast.info(`Đang mở: ${label}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-card rounded-[2rem] border-2 transition-all duration-300 overflow-hidden group flex flex-col h-full",
        session.status === "EXPIRED" 
          ? "border-destructive/20 shadow-lg shadow-destructive/5" 
          : "border-border/50 hover:border-primary/30 shadow-xl shadow-black/5"
      )}
    >
      {/* Header: Hut & Name */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
            <Hash size={14} className="font-bold" />
            <span className="text-sm font-black">Chòi {session.hut_number}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <ShoppingBag size={14} />
            <span>{session.product_count} SP</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black truncate">{session.customer_name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone size={14} />
            <span className="text-xs font-medium">{session.phone_number}</span>
          </div>
        </div>
      </div>

      {/* Timer Section (POS Style) */}
      <div className="px-6 py-4 bg-muted/30 flex flex-col items-center justify-center space-y-1 border-y border-border/50">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thời gian còn lại</p>
        <CountdownTimer 
          endTime={session.end_time} 
          onExpire={() => toast.error(`Hết giờ: Chòi ${session.hut_number}`)}
        />
      </div>

      {/* Financial Info */}
      <div className="px-6 py-4 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase">Tổng tạm tính</span>
        <span className="text-lg font-black text-primary">
          {session.total_amount.toLocaleString()}đ
        </span>
      </div>

      {/* Quick Actions (POS Grid) */}
      <div className="p-3 grid grid-cols-2 gap-2 mt-auto">
        <ActionButton 
          icon={<Plus size={18} />} 
          label="Thêm SP" 
          onClick={() => handleAction("Thêm sản phẩm")}
        />
        <ActionButton 
          icon={<History size={18} />} 
          label="Gia hạn" 
          onClick={() => handleAction("Gia hạn thời gian")}
        />
        <ActionButton 
          icon={<Scale size={18} />} 
          label="Thu cá" 
          onClick={() => handleAction("Thu mua cá")}
        />
        <ActionButton 
          icon={<CreditCard size={18} />} 
          label="Thanh toán" 
          variant="primary"
          onClick={() => handleAction("Thanh toán")}
        />
      </div>
    </motion.div>
  );
}

function ActionButton({ 
  icon, 
  label, 
  onClick, 
  variant = "secondary" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 border-2",
        variant === "primary"
          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
          : "bg-background border-border/50 hover:border-primary/20 text-foreground"
      )}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
