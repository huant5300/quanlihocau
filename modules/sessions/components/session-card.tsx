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
  Loader2
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
import { useUIStore } from "@/stores/ui-store";

interface SessionCardProps {
  session: FishingSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isWarning, setIsWarning] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { addNotification, removeNotificationByHut } = useUIStore();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedHutNumber = (session.hut_number || "")
    .replace("Chòi ", "")
    .replace("Chòi", "")
    .replace("Ô số ", "")
    .replace("Ô ", "");

  const handleCheckout = () => {
    setIsPaymentOpen(true);
    removeNotificationByHut(formattedHutNumber, "warning");
    removeNotificationByHut(formattedHutNumber, "expired");
  };

  const onWarning = () => {
    if (!isWarning) {
      setIsWarning(true);
      addNotification("warning", formattedHutNumber, `Ô số ${formattedHutNumber} sắp hết giờ câu!`);
      // Synthesize professional alert sound using Web Audio API (100% offline-ready & CORS safe)
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const playNote = (freq: number, start: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + duration);
          };
          const now = ctx.currentTime;
          playNote(523.25, now, 0.6); // C5
          playNote(659.25, now + 0.15, 0.8); // E5
        }
      } catch (e) {
        console.log("Audio play blocked or failed:", e);
      }
      toast.error(`CẢNH BÁO: Ô số ${formattedHutNumber} sắp hết thời gian!`, {
        duration: 10000,
        position: "top-center",
      });
    }
  };

  const onExpire = () => {
    addNotification("expired", formattedHutNumber, `Ô số ${formattedHutNumber} đã hết giờ câu!`);
    removeNotificationByHut(formattedHutNumber, "warning");
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const playNote = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        const now = ctx.currentTime;
        playNote(440, now, 0.4);
        playNote(440, now + 0.5, 0.4);
      }
    } catch (e) {
      console.log("Audio play blocked or failed:", e);
    }

    toast.error(`HẾT GIỜ: Ô số ${formattedHutNumber} đã hết thời gian câu! Vui lòng chuẩn bị thanh toán.`, {
      duration: 15000,
      position: "top-center",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={cn(
          "glass-card p-6 rounded-[2.5rem] flex flex-col gap-6 group transition-all relative border-2",
          isWarning 
            ? "border-red-500 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse-fast" 
            : "border-transparent hover:border-primary/20",
          isPending && "opacity-75"
        )}
      >
        {isWarning && (
          <div className="absolute -top-3 -right-3 z-20 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
            Sắp hết giờ
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-background/50 rounded-[2.5rem] flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {/* Header: Spot & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-colors relative overflow-hidden",
              isWarning ? "bg-red-500 shadow-red-500/20 animate-pulse" : "bg-primary shadow-primary/20"
            )}>
              <div className="absolute top-1 left-1 text-[8px] font-black opacity-50 uppercase tracking-tighter">Ô</div>
              <span className="font-black text-2xl tracking-tighter text-white">{formattedHutNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" />
                <p className="font-black text-sm tracking-tight uppercase">{session.customer_name || "Khách lẻ"}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone size={12} className="text-muted-foreground" />
                <p className="text-[11px] font-bold text-muted-foreground">{session.phone || "Chưa có SĐT"}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={12} className="text-muted-foreground" />
                <p className="text-[11px] font-bold text-muted-foreground">
                  Vào: {isMounted ? new Date(session.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"}
                </p>
              </div>
            </div>
          </div>
          <SessionStatusBadge status={isWarning ? "WARNING" : session.status} />
        </div>

        {/* Timer & Info */}
        <div className="bg-background/50 rounded-3xl p-6 border border-black/5 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thời gian còn lại</p>
            <CountdownTimer 
              endTime={session.endTime ?? new Date().toISOString()} 
              sessionId={session.id} 
              onWarning={onWarning}
              onExpire={onExpire}
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Sản phẩm</span>
            </div>
            <p className={cn(
              "text-xl font-black tracking-tight",
              isWarning ? "text-red-500" : "text-primary"
            )}>
              {(session.total_amount || 0).toLocaleString()}đ
            </p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex flex-col gap-2">
          {/* Row 1: Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <AddProductModal 
              sessionId={session.id} 
              hutNumber={formattedHutNumber} 
              className="h-11 bg-accent/40 hover:bg-accent/80 dark:bg-accent/30 dark:hover:bg-accent/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 text-foreground/80"
            />
            <ExtendSessionModal 
              sessionId={session.id} 
              hutNumber={formattedHutNumber} 
              className="h-11 bg-accent/40 hover:bg-accent/80 dark:bg-accent/30 dark:hover:bg-accent/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 text-foreground/80"
            />
            <FishBuybackModal 
              sessionId={session.id} 
              hutNumber={formattedHutNumber} 
              className="h-11 bg-accent/40 hover:bg-accent/80 dark:bg-accent/30 dark:hover:bg-accent/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 text-foreground/80"
            />
          </div>
          
          {/* Row 2: Main Call to Action */}
          <button 
            onClick={handleCheckout}
            disabled={isPending}
            className={cn(
              "h-12 w-full text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50",
              isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
            )}
          >
            <CreditCard size={16} /> Thanh toán
          </button>
        </div>

        {/* Guidance Line */}
        <div className="mt-2 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            {isWarning 
              ? "Gợi ý: Khách sắp hết giờ, hãy hỏi gia hạn hoặc chuẩn bị thanh toán" 
              : "Gợi ý: Nhấn 'Thu cá' để ghi nhận cá khách câu được và trừ vào bill"}
          </p>
        </div>
      </motion.div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        billData={{
          sessionId: session.id,
          hutNumber: formattedHutNumber,
          customerName: session.customer_name || "Khách lẻ",
          sessionFee: Number(session.sessionCost || 0),
          products: (session.session_products || []).map((p: any) => ({
            id: p.id,
            name: p.name || "Sản phẩm",
            quantity: p.quantity,
            price: p.price || p.price_at_time
          })),
          buybackDeduction: (session.fish_buybacks || []).reduce((sum, b) => sum + Number(b.total_price), 0),
          prepaidAmount: Number(session.prepaidAmount || 0),
          subtotal: Number(session.sessionCost || 0) + (session.session_products || []).reduce((sum, p) => sum + Number((p.price || p.price_at_time || 0) * p.quantity), 0),
          totalAmount: Number(session.total_amount || 0)
        }}
      />
    </>
  );
}
