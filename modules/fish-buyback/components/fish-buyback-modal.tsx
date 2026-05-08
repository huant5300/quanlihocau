"use client";

import React from "react";
import { X, Check, Scale, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFishBuyback } from "../hooks/use-fish-buyback";
import { FishTypeSelector } from "./fish-type-selector";
import { WeightInput } from "./weight-input";
import { BuybackSummary } from "./buyback-summary";
import { FISH_TYPES } from "../types/buyback.types";

interface FishBuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  hutNumber?: string;
}

export function FishBuybackModal({ isOpen, onClose, hutNumber }: FishBuybackModalProps) {
  const { form, handleTypeSelect, total } = useFishBuyback();

  if (!isOpen) return null;

  const currentType = FISH_TYPES.find(f => f.type === form.watch("fishType"));

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
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl bg-background rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Scale size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Thu mua cá - Chòi {hutNumber}</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Cân cá & Khấu trừ hóa đơn</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center hover:bg-accent transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8 pb-32">
            <FishTypeSelector 
              selectedType={form.watch("fishType")}
              onSelect={handleTypeSelect}
            />

            <WeightInput 
              value={form.watch("weight")}
              onChange={(val) => form.setValue("weight", val)}
            />

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <History size={14} /> Lịch sử gần đây
              </h3>
              <div className="bg-accent/30 rounded-2xl p-4 border border-dashed border-border">
                <p className="text-[10px] font-bold text-muted-foreground text-center italic">Chưa có lượt thu mua nào trong phiên này</p>
              </div>
            </div>
          </div>

          {/* Fixed Footer Summary */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
            <div className="pointer-events-auto space-y-4">
              <BuybackSummary 
                fishLabel={currentType?.label || ""}
                weight={form.watch("weight")}
                pricePerKg={form.watch("pricePerKg")}
                total={total}
              />

              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-accent/50 hover:bg-accent transition-all active:scale-95"
                >
                  Đóng
                </button>
                <button
                  onClick={() => console.log("Success:", form.getValues())}
                  className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-orange-500 text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
                >
                  <Check size={20} strokeWidth={3} />
                  Xác nhận thu mua
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
