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

  const formattedHutNumber = (session.hut_number || "")
    .replace("Chòi ", "")
    .replace("Chòi", "")
    .replace("Ô số ", "")
    .replace("Ô ", "");

  const handleCheckout = () => {
    setIsPaymentOpen(true);
  };

  const onWarning = () => {
    if (!isWarning) {
      setIsWarning(true);
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => console.log("Audio play blocked"));
      toast.error(`CẢNH BÁO: Ô số ${formattedHutNumber} sắp hết thời gian!`, {
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
          "w-full lg:h-24 bg-card/90 dark:bg-card/40 backdrop-blur-xl border-2 rounded-3xl lg:rounded-[2rem] flex flex-col lg:flex-row items-stretch lg:items-center p-4 lg:p-6 lg:px-8 gap-3 lg:gap-8 group transition-all relative overflow-hidden",
          isWarning 
            ? "border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse-fast" 
            : "border-black/5 dark:border-white/5 hover:border-primary/20",
          isPending && "opacity-75"
        )}
      >
        {/* ROW 1: Mobile Header (Spot, Customer, Timer) / Flat on Desktop */}
        <div className="flex items-center justify-between lg:contents w-full">
          {/* Left: Spot & Customer Info */}
          <div className="flex items-center gap-3 lg:gap-4 lg:flex-1 lg:min-w-0">
            {/* Spot Number Badge */}
            <div className={cn(
              "w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden",
              isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
            )}>
              <div className="absolute top-0.5 left-1 text-[7px] lg:text-[8px] font-black opacity-50 uppercase tracking-tighter">Ô</div>
              <span className="font-black text-lg lg:text-2xl text-white tracking-tighter">{formattedHutNumber}</span>
            </div>

            {/* Customer Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-muted-foreground shrink-0" />
                <p className="font-black text-[13px] lg:text-sm uppercase truncate max-w-[120px] lg:max-w-none">{session.customer_name || "Khách lẻ"}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={11} className="text-muted-foreground shrink-0" />
                <p className="text-[9px] lg:text-[10px] font-bold text-muted-foreground truncate">{session.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Right: Countdown Timer */}
          <div className="flex items-center lg:justify-center lg:px-8 lg:border-x border-black/5 dark:border-white/5 lg:h-full shrink-0">
            <div className="flex flex-col items-end lg:items-center">
              <p className="text-[8px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Còn lại</p>
              <CountdownTimer 
                endTime={session.endTime ?? new Date().toISOString()} 
                sessionId={session.id} 
                onWarning={onWarning}
              />
            </div>
          </div>
        </div>

        {/* ROW 2: Mobile Actions & Financials (Tạm tính & Buttons) / Flat on Desktop */}
        <div className="flex items-center justify-between lg:contents w-full pt-3 lg:pt-0 border-t border-black/5 dark:border-white/5 lg:border-t-0">
          {/* Left: Total Amount */}
          <div className="flex flex-col items-start lg:items-end justify-center min-w-[80px] lg:min-w-[120px]">
            <p className="text-[8px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Tạm tính</p>
            <p className={cn(
              "text-base lg:text-xl font-black tracking-tight",
              isWarning ? "text-red-500" : "text-primary"
            )}>
              {(session.total_amount || 0).toLocaleString()}đ
            </p>
          </div>

          {/* Right: Action Buttons Group */}
          <div className="flex items-center gap-1.5 lg:gap-2 lg:pl-4 shrink-0">
            <AddProductModal 
              sessionId={session.id} 
              hutNumber={formattedHutNumber} 
              className="w-10 h-10 lg:w-auto lg:h-12 bg-accent/40 hover:bg-accent/80 dark:bg-accent/30 dark:hover:bg-accent/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-0 lg:px-4 shrink-0 text-foreground/80"
            />
            <ExtendSessionModal 
              sessionId={session.id} 
              hutNumber={formattedHutNumber} 
              className="w-10 h-10 lg:w-auto lg:h-12 bg-accent/40 hover:bg-accent/80 dark:bg-accent/30 dark:hover:bg-accent/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-0 lg:px-4 shrink-0 text-foreground/80"
            />
            <FishBuybackModal 
              sessionId={session.id} 
              hutNumber={formattedHutNumber} 
              className="w-10 h-10 lg:w-auto lg:h-12 bg-accent/40 hover:bg-accent/80 dark:bg-accent/30 dark:hover:bg-accent/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-0 lg:px-4 shrink-0 text-foreground/80"
            />
            <button 
              onClick={handleCheckout}
              className={cn(
                "h-10 lg:h-12 px-3.5 lg:px-6 text-white rounded-xl flex items-center justify-center gap-1.5 lg:gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all w-auto shrink-0",
                isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
              )}
            >
              <CreditCard size={15} /> 
              <span className="hidden lg:inline">Thanh toán</span>
              <span className="inline lg:hidden text-[9px]">T.Toán</span>
            </button>
          </div>
        </div>

        {/* Guidance Popover Hint (Desktop Only) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all hidden lg:block">
          <ChevronRight className="text-muted-foreground" size={20} />
        </div>
      </motion.div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        billData={{
          sessionId: session.id,
          hutNumber: formattedHutNumber,
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
