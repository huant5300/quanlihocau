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
  Fish,
  MoreVertical,
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
import Link from "next/link";

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
          playNote(523.25, now, 0.6);
          playNote(659.25, now + 0.15, 0.8);
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
    toast.error(`HẾT GIỜ: Ô số ${formattedHutNumber} đã hết thời gian câu!`, {
      duration: 15000,
      position: "top-center",
    });
  };

  const productCount = (session.session_products || []).length;
  const catchCount = (session.fish_buybacks || []).length;
  const totalAmount = Number(session.total_amount || 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className={cn(
          "bg-white rounded-2xl border transition-all flex flex-col overflow-hidden shadow-sm hover:shadow-md",
          isWarning
            ? "border-red-300 ring-2 ring-red-200 shadow-red-100"
            : "border-gray-200",
          isPending && "opacity-60"
        )}
      >
        {/* ===== STATUS STRIPE (top bar) ===== */}
        <div
          className={cn(
            "h-1.5 w-full",
            isWarning ? "bg-red-500" : "bg-blue-500"
          )}
        />

        {/* ===== CARD BODY ===== */}
        <div className="p-4 flex flex-col gap-4">

          {/* Header Row: Hut + Customer + Status */}
          <div className="flex items-start gap-3">
            {/* Hut Number Badge */}
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative",
                isWarning
                  ? "bg-red-50 border-2 border-red-200"
                  : "bg-blue-50 border-2 border-blue-100"
              )}
            >
              <span className="absolute top-1 left-1.5 text-[8px] font-bold text-gray-400 uppercase">Ô</span>
              <span
                className={cn(
                  "font-black text-2xl leading-none",
                  isWarning ? "text-red-600" : "text-blue-700"
                )}
              >
                {formattedHutNumber}
              </span>
            </div>

            {/* Customer Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">
                {session.customerId ? (
                  <Link href={`/dashboard/customers/${session.customerId}`} className="hover:text-primary transition-colors">
                    {session.customer_name || "Khách lẻ"}
                  </Link>
                ) : (
                  session.customer_name || "Khách lẻ"
                )}
              </p>
              {session.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-500">{session.phone}</p>
                </div>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={11} className="text-gray-400" />
                <p className="text-xs text-gray-500">
                  Vào:{" "}
                  {isMounted
                    ? new Date(session.startTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "--:--"}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <SessionStatusBadge status={isWarning ? "WARNING" : session.status} />
          </div>

          {/* ===== TIMER + AMOUNT ===== */}
          <div
            className={cn(
              "rounded-xl p-3 flex items-center justify-between",
              isWarning ? "bg-red-50" : "bg-gray-50"
            )}
          >
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Thời gian còn lại
              </p>
              <CountdownTimer
                endTime={session.endTime ?? new Date().toISOString()}
                sessionId={session.id}
                onWarning={onWarning}
                onExpire={onExpire}
              />
            </div>

            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Tạm tính
              </p>
              <p
                className={cn(
                  "text-xl font-black",
                  isWarning ? "text-red-600" : "text-blue-700"
                )}
              >
                {totalAmount.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>

          {/* ===== QUICK STATS ===== */}
          {(productCount > 0 || catchCount > 0) && (
            <div className="flex gap-2">
              {productCount > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">
                  <ShoppingBag size={12} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">
                    {productCount} SP
                  </span>
                </div>
              )}
              {catchCount > 0 && (
                <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 px-2.5 py-1.5 rounded-lg">
                  <Fish size={12} className="text-teal-500" />
                  <span className="text-xs font-bold text-teal-700">
                    {catchCount} cá
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ===== ACTION BUTTONS ===== */}
          <div className="grid grid-cols-3 gap-2">
            <AddProductModal
              sessionId={session.id}
              hutNumber={formattedHutNumber}
              className="h-11 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-xl flex items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 text-gray-600"
            />
            <ExtendSessionModal
              sessionId={session.id}
              hutNumber={formattedHutNumber}
              className="h-11 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-xl flex items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 text-gray-600"
            />
            <FishBuybackModal
              sessionId={session.id}
              hutNumber={formattedHutNumber}
              className="h-11 bg-gray-100 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 border border-transparent rounded-xl flex items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 text-gray-600"
            />
          </div>

          {/* ===== CHECKOUT CTA ===== */}
          <button
            onClick={handleCheckout}
            disabled={isPending}
            className={cn(
              "w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm",
              isWarning
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-100"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
            )}
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CreditCard size={16} />
            )}
            Thanh toán
          </button>
        </div>
      </motion.div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        billData={{
          sessionId: session.id,
          hutNumber: formattedHutNumber,
          customerName: session.customer_name || "Khách lẻ",
          sessionFee: Number(session.sessionAmount || 0),
          products: (session.session_products || []).map((p: any) => ({
            id: p.id,
            name: p.name || "Sản phẩm",
            quantity: p.quantity,
            price: p.price || p.price_at_time,
          })),
          buybackDeduction: Number(session.buybackValue || 0),
          prepaidAmount: Number(session.prepaidAmount || 0),
          subtotal:
            Number(session.sessionAmount || 0) +
            (session.session_products || []).reduce(
              (sum, p) =>
                sum + Number((p.price || p.price_at_time || 0) * p.quantity),
              0
            ),
          totalAmount: Number(session.total_amount || 0),
        }}
      />
    </>
  );
}
