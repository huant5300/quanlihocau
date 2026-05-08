"use client";

import React, { useState } from "react";
import { 
  X, 
  Printer, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  Clock, 
  ShoppingBag, 
  Fish,
  Loader2,
  ReceiptText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    hut_number: string;
    customer_name: string;
    package_total: number;
    product_total: number;
    fish_buyback: number;
  };
}

export function PaymentModal({ isOpen, onClose, session }: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const grandTotal = session.package_total + session.product_total - session.fish_buyback;

  const handlePayment = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success("Thanh toán thành công!");
    
    // Auto close after success animation
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="relative w-full max-w-lg bg-card rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {isSuccess ? (
            <SuccessState onClose={onClose} />
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-8 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <ReceiptText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Thanh toán</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Chòi {session.hut_number} • {session.customer_name}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-accent rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Invoice Summary */}
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <SummaryItem 
                    icon={<Clock size={16} />} 
                    label="Tổng tiền gói câu" 
                    value={session.package_total} 
                  />
                  <SummaryItem 
                    icon={<ShoppingBag size={16} />} 
                    label="Tổng tiền dịch vụ" 
                    value={session.product_total} 
                  />
                  <SummaryItem 
                    icon={<Fish size={16} />} 
                    label="Tiền thu mua cá" 
                    value={-session.fish_buyback} 
                    isNegative 
                  />
                </div>

                <div className="pt-6 border-t border-dashed">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Tổng cộng</span>
                    <span className="text-3xl font-black text-primary">
                      {grandTotal.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-8 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button className="h-14 bg-accent/50 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all">
                    <Printer size={20} /> In hóa đơn
                  </button>
                  <button 
                    onClick={handlePayment}
                    disabled={isSubmitting}
                    className="h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <><CreditCard size={20} /> Xác nhận</>
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-2">
                  Vui lòng kiểm tra lại thông tin trước khi xác nhận
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SummaryItem({ 
  icon, 
  label, 
  value, 
  isNegative = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  isNegative?: boolean 
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className={cn("text-sm font-black", isNegative ? "text-orange-500" : "text-foreground")}>
        {isNegative ? "-" : ""}{Math.abs(value).toLocaleString()}đ
      </span>
    </div>
  );
}

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-12 flex flex-col items-center justify-center text-center space-y-6"
    >
      <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
        <CheckCircle2 size={64} />
      </div>
      <div>
        <h2 className="text-2xl font-black">Thành công!</h2>
        <p className="text-muted-foreground mt-2">Hóa đơn đã được thanh toán và lưu trữ.</p>
      </div>
      <button 
        onClick={onClose}
        className="px-8 h-12 bg-accent rounded-xl font-bold hover:bg-accent/80 transition-colors"
      >
        Đóng
      </button>
    </motion.div>
  );
}
