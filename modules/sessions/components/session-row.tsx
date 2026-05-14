"use client";

import React, { useTransition, useState } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Clock, 
  RotateCcw, 
  CreditCard,
  User,
  Phone,
  Loader2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/utils/utils";
import { FishingSession } from "../types/session.types";
import { CountdownTimer } from "./countdown-timer";
import { SessionStatusBadge } from "./session-status-badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AddProductModal } from "./add-product-modal";
import { ExtendSessionModal } from "./extend-session-modal";
import { FishBuybackModal } from "./fish-buyback-modal";
import { PaymentModal } from "@/modules/payment/components/payment-modal";

interface SessionRowProps {
  session: FishingSession;
}

export function SessionRow({ session }: SessionRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isWarning, setIsWarning] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleCheckout = () => {
    setIsPaymentOpen(true);
  };

  const onWarning = () => {
    if (!isWarning) {
      setIsWarning(true);
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => console.log("Audio play blocked"));
      toast.error(`CẢNH BÁO: Ô số ${session.hut_number} sắp hết thời gian!`, {
        duration: 10000,
        position: "top-center",
      });
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "w-full lg:h-24 bg-card/40 backdrop-blur-xl border-2 rounded-[2rem] flex flex-col lg:flex-row items-stretch lg:items-center p-6 lg:px-8 gap-6 lg:gap-8 group transition-all relative overflow-hidden",
          isWarning 
            ? "border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse-fast" 
            : "border-white/5 hover:border-primary/20",
          isPending && "opacity-75"
        )}
      >
        {/* Spot Number */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
          isWarning ? "bg-red-500" : "bg-primary"
        )}>
          <span className="font-black text-2xl text-white tracking-tighter">{session.hut_number}</span>
        </div>

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <p className="font-black text-sm uppercase truncate">{session.customer_name || "Khách lẻ"}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Phone size={12} className="text-muted-foreground" />
            <p className="text-[10px] font-bold text-muted-foreground truncate">{session.phone || "N/A"}</p>
          </div>
        </div>

        {/* Timer & Total Side-by-side on mobile */}
        <div className="flex items-center justify-between lg:contents gap-4">
          {/* Countdown Timer */}
          <div className="flex flex-col items-start lg:items-center justify-center lg:px-8 lg:border-x border-white/5 h-full">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Còn lại</p>
            <CountdownTimer 
              endTime={session.endTime ?? new Date().toISOString()} 
              sessionId={session.id} 
              onWarning={onWarning}
            />
          </div>

          {/* Total Amount */}
          <div className="flex flex-col items-end justify-center min-w-[100px] lg:min-w-[120px]">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tạm tính</p>
            <p className={cn(
              "text-xl font-black tracking-tight",
              isWarning ? "text-red-500" : "text-primary"
            )}>
              {(session.total_amount || 0).toLocaleString()}đ
            </p>
          </div>
        </div>

        {/* Action Buttons - Grid on mobile */}
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 lg:gap-2 lg:pl-4">
          <AddProductModal sessionId={session.id} hutNumber={session.hut_number} />
          <ExtendSessionModal sessionId={session.id} hutNumber={session.hut_number} />
          <FishBuybackModal sessionId={session.id} hutNumber={session.hut_number} />
          <button 
            onClick={handleCheckout}
            className={cn(
              "h-12 px-6 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all col-span-2 lg:col-span-1",
              isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
            )}
          >
            <CreditCard size={16} /> Thanh toán
          </button>
        </div>

        {/* Guidance Popover Hint */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
          <ChevronRight className="text-muted-foreground" size={20} />
        </div>
      </motion.div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        billData={{
          sessionId: session.id,
          hutNumber: session.hut_number,
          customerName: session.customer_name || "Khách lẻ",
          sessionFee: session.total_amount,
          products: (session.session_products || []).map((p: any) => ({
            id: p.id,
            name: p.name || "Sản phẩm",
            quantity: p.quantity,
            price: p.price || p.price_at_time
          })),
          buybackDeduction: (session.fish_buybacks || []).reduce((sum, b) => sum + Number(b.total_price), 0),
          prepaidAmount: Number(session.prepaidAmount || 0),
          subtotal: session.total_amount,
          totalAmount: session.total_amount
        }}
      />
    </>
  );
}
