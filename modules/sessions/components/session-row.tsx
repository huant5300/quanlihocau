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
import { useUIStore } from "@/stores/ui-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionRowProps {
  session: FishingSession;
}

export function SessionRow({ session }: SessionRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isWarning, setIsWarning] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { addNotification, removeNotificationByHut } = useUIStore();

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

  const handleAutoCheckout = async () => {
    if (isPending) return;
    
    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/tickets/sessions/${session.id}/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethod: "CASH",
            notes: "Tự động thanh toán khi hết giờ"
          })
        });
        const data = await response.json();
        if (data.id) {
          // Trigger expired notification and clear warnings
          addNotification("expired", formattedHutNumber, `Ô số ${formattedHutNumber} đã tự động thanh toán!`);
          removeNotificationByHut(formattedHutNumber, "warning");
          
          toast.success(`HỆ THỐNG: Ô số ${formattedHutNumber} đã hết giờ và tự động thanh toán thành công!`, {
            duration: 10000,
          });
          
          // Triggers refetch/refresh to sync data
          window.location.reload();
        }
      } catch (err) {
        console.error("Auto checkout error:", err);
      }
    });
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
    handleAutoCheckout();
  };

  return (
    <>
      {/* Redesigned thin horizontal row layout */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsDetailsOpen(true)}
        className={cn(
          "w-full h-20 sm:h-24 bg-card/95 dark:bg-card/45 backdrop-blur-xl border rounded-2xl px-6 sm:px-8 flex items-center justify-between cursor-pointer transition-all hover:border-primary/30 relative overflow-hidden shadow-md hover:shadow-lg select-none",
          isWarning 
            ? "border-red-500/80 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.06)]" 
            : "border-black/5 dark:border-white/5",
          isPending && "opacity-75"
        )}
      >
        {isPending && (
          <div className="absolute inset-0 bg-background/50 rounded-2xl flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        )}

        {/* Left Section: Spot Number & Customer Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            "px-4 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
            isWarning ? "bg-red-500 text-white" : "bg-primary text-white"
          )}>
            <span className="font-black text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">
              Ô {formattedHutNumber}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-muted-foreground shrink-0" />
              <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-foreground/90 truncate">
                {session.customer_name || "Khách lẻ"}
              </p>
            </div>
            {session.phone && (
              <p className="text-[10px] font-bold text-muted-foreground truncate mt-0.5">
                {session.phone}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Timer, Status, Price & Chevron */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Realtime Countdown Timer */}
          <div className="flex flex-col items-end hidden xs:flex">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Thời gian</span>
            <CountdownTimer 
              endTime={session.endTime ?? new Date().toISOString()} 
              sessionId={session.id} 
              onWarning={onWarning}
              onExpire={onExpire}
            />
          </div>

          {/* Status Badge */}
          <SessionStatusBadge status={isWarning ? "WARNING" : session.status} />

          {/* Simple Chevron Click Indicator */}
          <ChevronRight size={18} className="text-muted-foreground/60 group-hover:text-primary transition-colors hidden sm:block" />
        </div>
      </motion.div>

      {/* Dialog Chi tiết Lượt câu */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-0 overflow-hidden bg-card dark:bg-[#0f1422] border-2 border-border/80 shadow-2xl">
          {/* Header block inside Dialog */}
          <div className="p-6 sm:p-8 bg-[#0c111e] text-white space-y-4 relative overflow-hidden">
            {/* Glowing decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-emerald-500/[0.04] pointer-events-none" />
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                  <span className="font-black text-xs text-white uppercase tracking-wider">
                    Ô SỐ {formattedHutNumber}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-tight text-white flex items-center gap-1.5">
                    <User size={14} className="text-emerald-400 shrink-0" />
                    {session.customer_name || "Khách lẻ"}
                  </h3>
                  {session.phone && (
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone size={11} className="shrink-0" />
                      {session.phone}
                    </p>
                  )}
                </div>
              </div>
              <SessionStatusBadge status={isWarning ? "WARNING" : session.status} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="space-y-0.5">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian còn lại</p>
                <CountdownTimer 
                  endTime={session.endTime ?? new Date().toISOString()} 
                  sessionId={session.id} 
                  onWarning={onWarning}
                  onExpire={onExpire}
                />
              </div>
              <p className="text-2xl font-black text-emerald-400 tracking-tight">
                {(session.total_amount || 0).toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* Details Content Block */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-2">
                Chi tiết dịch vụ / sản phẩm đã dùng
              </p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {(!session.session_products || session.session_products.length === 0) && 
                 (!session.fish_buybacks || session.fish_buybacks.length === 0) ? (
                  <p className="text-[11px] italic text-muted-foreground py-1">Chưa sử dụng sản phẩm/dịch vụ hoặc thu cá.</p>
                ) : (
                  <div className="space-y-2">
                    {/* Products list */}
                    {session.session_products?.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-black/5 dark:border-white/5 last:border-0">
                        <span className="font-bold text-foreground/80 uppercase tracking-tight">{p.name || "Sản phẩm"}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-medium">x{p.quantity}</span>
                          <span className="font-black text-primary">{(p.price * p.quantity).toLocaleString()}đ</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Fish buybacks list */}
                    {session.fish_buybacks?.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-black/5 dark:border-white/5 last:border-0 text-emerald-600 dark:text-emerald-400">
                        <span className="font-bold uppercase tracking-tight">Thu cá: {b.fish_name || "Cá"} ({b.weight || 0}kg)</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">-</span>
                          <span className="font-black">-{Number(b.total_price).toLocaleString()}đ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick action buttons & Checkout inside Dialog */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <AddProductModal 
                  sessionId={session.id} 
                  hutNumber={formattedHutNumber} 
                  className="h-12 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 shrink-0 outline-none border border-emerald-500/20"
                />
                
                <ExtendSessionModal 
                  sessionId={session.id} 
                  hutNumber={formattedHutNumber} 
                  className="h-12 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 shrink-0 outline-none border border-blue-500/20"
                />
                
                <FishBuybackModal 
                  sessionId={session.id} 
                  hutNumber={formattedHutNumber} 
                  className="h-12 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 shrink-0 outline-none border border-amber-500/20"
                />
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isPending}
                className={cn(
                  "h-14 w-full text-white rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 outline-none",
                  isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
                )}
              >
                <CreditCard size={16} /> 
                Thanh toán hóa đơn
              </button>
            </div>

            {/* Guidance Line at the bottom of the Dialog */}
            <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {isWarning 
                  ? "Khách sắp hết giờ, hãy hỏi gia hạn hoặc chuẩn bị thanh toán" 
                  : "Nhấn các nút trên để cập nhật hoặc thanh toán trực tiếp."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal thanh toán đồng bộ */}
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
