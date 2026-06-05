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
      {/* 1 HÀNG NGANG tối giản hiển thị cả trên PC và Mobile */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsDetailsOpen(true)}
        className={cn(
          "w-full h-20 sm:h-24 bg-card/90 dark:bg-card/40 backdrop-blur-xl border-2 rounded-[1.8rem] flex flex-row items-center justify-between p-4 sm:p-5 px-5 sm:px-8 gap-4 group transition-all relative overflow-hidden cursor-pointer",
          isWarning 
            ? "border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse-fast" 
            : "border-black/5 dark:border-white/5 hover:border-primary/20",
          isPending && "opacity-75"
        )}
      >
        {isPending && (
          <div className="absolute inset-0 bg-background/50 rounded-[1.8rem] flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}

        {/* Trái: Badge Ô câu hình chữ nhật lớn và Thông tin khách hàng */}
        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
          {/* Badge Ô câu mở rộng thành hình chữ nhật */}
          <div className={cn(
            "px-4 sm:px-5 h-11 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-colors",
            isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
          )}>
            <span className="font-black text-xs sm:text-sm text-white uppercase tracking-wider whitespace-nowrap">
              Ô SỐ {formattedHutNumber}
            </span>
          </div>

          {/* Thông tin khách hàng */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-muted-foreground shrink-0" />
              <p className="font-black text-[13px] sm:text-sm uppercase truncate max-w-[120px] sm:max-w-none">
                {session.customer_name || "Khách lẻ"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
              <Phone size={11} className="text-muted-foreground shrink-0" />
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground truncate">
                {session.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Phải: Đồng hồ đếm ngược */}
        <div className="flex items-center justify-center shrink-0">
          <div className="flex flex-col items-end">
            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Còn lại</p>
            <CountdownTimer 
              endTime={session.endTime ?? new Date().toISOString()} 
              sessionId={session.id} 
              onWarning={onWarning}
              onExpire={onExpire}
            />
          </div>
        </div>

        {/* Mũi tên chỉ dẫn hover (Desktop) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all hidden lg:block">
          <ChevronRight className="text-muted-foreground" size={20} />
        </div>
      </motion.div>

      {/* Pop up hiển thị đầy đủ thông tin chi tiết và hành động */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 font-sans">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-black">
                Ô SỐ {formattedHutNumber}
              </div>
              Chi tiết lượt câu
            </DialogTitle>
          </DialogHeader>

          {/* Nội dung chi tiết */}
          <div className="space-y-6">
            
            {/* Thẻ thông tin khách hàng */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Khách hàng</p>
                  <p className="text-sm font-black uppercase text-slate-800 dark:text-slate-200">
                    {session.customer_name || "Khách lẻ"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Số điện thoại</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {session.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>

            {/* Thời gian và Tạm tính */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian còn lại</p>
                <div className="mt-2 scale-90 origin-left">
                  <CountdownTimer 
                    endTime={session.endTime ?? new Date().toISOString()} 
                    sessionId={session.id} 
                    onWarning={onWarning}
                    onExpire={onExpire}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tạm tính</p>
                <p className={cn(
                  "text-lg font-black tracking-tight mt-2",
                  isWarning ? "text-red-500" : "text-primary"
                )}>
                  {(session.total_amount || 0).toLocaleString()}đ
                </p>
              </div>
            </div>

            {/* Dòng hướng dẫn / gợi ý */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                {isWarning 
                  ? "Gợi ý: Khách sắp hết giờ, hãy hỏi gia hạn hoặc chuẩn bị thanh toán" 
                  : "Gợi ý: Nhấn 'Thu cá' để ghi nhận cá khách câu được và khấu trừ vào bill"}
              </p>
            </div>

            {/* Danh sách hành động nhanh gộp chung */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Thao tác nhanh</p>
              
              <div className="grid grid-cols-3 gap-2">
                <AddProductModal 
                  sessionId={session.id} 
                  hutNumber={formattedHutNumber} 
                  className="h-12 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 shrink-0 outline-none"
                />
                
                <ExtendSessionModal 
                  sessionId={session.id} 
                  hutNumber={formattedHutNumber} 
                  className="h-12 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 shrink-0 outline-none"
                />
                
                <FishBuybackModal 
                  sessionId={session.id} 
                  hutNumber={formattedHutNumber} 
                  className="h-12 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 text-center px-1 shrink-0 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer nút đóng và nút Thanh toán chính */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex gap-3">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 outline-none"
            >
              Đóng
            </button>
            <button 
              onClick={() => {
                setIsDetailsOpen(false);
                handleCheckout();
              }}
              disabled={isPending}
              className={cn(
                "flex-[2] h-12 text-white rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 outline-none",
                isWarning ? "bg-red-500 shadow-red-500/20" : "bg-primary shadow-primary/20"
              )}
            >
              <CreditCard size={15} /> 
              Thanh toán
            </button>
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
