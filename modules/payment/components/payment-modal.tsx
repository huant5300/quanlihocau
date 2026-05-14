"use client";

import React from "react";
import { X, Check, Printer, CreditCard, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePayment } from "../hooks/use-payment";
import { BillSummary } from "./bill-summary";
import { PaymentMethodSelector } from "./payment-method-selector";
import { FinalCalculationCard } from "./final-calculation-card";
import { BillData } from "../types/payment.types";
import { cn } from "@/utils/utils";
import { printerService } from "@/services/printer/printer-service";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: BillData;
}

export function PaymentModal({ isOpen, onClose, billData }: PaymentModalProps) {
  const { form, onSubmit, isLoading, isSuccess, setIsSuccess } = usePayment(billData.totalAmount, billData.sessionId);

  // Auto-print on success
  React.useEffect(() => {
    if (isSuccess) {
      printerService.printBill(billData);
    }
  }, [isSuccess, billData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />

        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="relative w-full max-w-2xl bg-background rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {isSuccess ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in">
              <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-green-500/30">
                <Check size={48} strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Thanh toán hoàn tất!</h2>
                <p className="text-muted-foreground font-bold mt-2">Giao dịch đã được ghi nhận vào hệ thống.</p>
              </div>
              <div className="grid grid-cols-1 w-full gap-4">
                <button 
                  onClick={() => printerService.printBill(billData)}
                  className="h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95"
                >
                  <Printer size={20} /> In hóa đơn
                </button>
                <button 
                  onClick={() => { setIsSuccess(false); onClose(); }}
                  className="h-16 bg-accent rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Thanh toán hóa đơn</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {billData.customerName} - Chòi {billData.hutNumber}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center hover:bg-muted active:scale-90 transition-all">
                  <X size={24} />
                </button>
              </div>

              {/* Guidance Bar */}
              <div className="px-8 py-3 bg-primary/5 border-b border-primary/10 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
                  {!form.getValues("paymentMethod") 
                    ? "Bước 1: Kiểm tra lại các khoản phí và chọn phương thức thanh toán" 
                    : "Bước cuối: Nhấn 'Hoàn tất thanh toán' để giải phóng chòi và in hóa đơn"}
                </p>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
                <BillSummary bill={billData} />
                
                <PaymentMethodSelector 
                  selected={form.watch("paymentMethod")}
                  onSelect={(method) => form.setValue("paymentMethod", method)}
                />

                <FinalCalculationCard 
                  subtotal={billData.subtotal}
                  buybackDeduction={billData.buybackDeduction}
                  prepaidAmount={billData.prepaidAmount}
                  total={billData.totalAmount}
                />
              </div>

              {/* Footer */}
              <div className="p-8 pt-0 flex items-center gap-4">
                <button onClick={onClose} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-accent/50 hover:bg-accent transition-all active:scale-95">
                  Hủy
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => onSubmit(form.getValues())}
                  className={cn(
                    "flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20",
                    isLoading ? "bg-muted" : "bg-primary text-white"
                  )}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Hoàn tất thanh toán
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
