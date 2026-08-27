"use client";

import React, { useState } from "react";
import { X, Check, Scale, History, Fish, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFishBuyback } from "../hooks/use-fish-buyback";
import { FishTypeSelector } from "./fish-type-selector";
import { WeightInput } from "./weight-input";
import { BuybackSummary } from "./buyback-summary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FishBuybackModalProps {
  sessionId: string;
  hutNumber?: string;
  className?: string;
}

export function FishBuybackModal({ sessionId, hutNumber, className }: FishBuybackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    form,
    fishTypes,
    catches,
    isLoadingTypes,
    isLoadingCatches,
    isSubmitting,
    handleTypeSelect,
    handleSubmit,
    total,
    totalBuybackAmount,
  } = useFishBuyback(sessionId);

  const selectedFish = fishTypes.find((f) => f.id === form.watch("fishTypeId"));

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={className || "h-14 px-6 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95"}
      >
        <Scale size={14} className="shrink-0" />
        <span className="hidden sm:inline ml-1">Thu cá</span>
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden bg-background border-2 border-border/80 shadow-2xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Scale size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Thu mua cá</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  Ô số {hutNumber} — Cân cá & Khấu trừ hóa đơn
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8 pb-56">
            {/* Fish Type Selector - from API */}
            <FishTypeSelector
              fishTypes={fishTypes}
              selectedTypeId={form.watch("fishTypeId")}
              isLoading={isLoadingTypes}
              onSelect={handleTypeSelect}
            />

            {/* Weight Input */}
            <WeightInput
              value={form.watch("weight")}
              onChange={(val) => form.setValue("weight", val)}
            />

            {/* History Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <History size={14} /> Lịch sử thu mua trong phiên này
              </h3>

              {isLoadingCatches ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin text-muted-foreground" size={20} />
                </div>
              ) : catches.length === 0 ? (
                <div className="bg-accent/30 rounded-2xl p-4 border border-dashed border-border">
                  <p className="text-[10px] font-bold text-muted-foreground text-center italic">
                    Chưa có lượt thu mua nào trong phiên này
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {catches.map((c: any) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center">
                          <Fish size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">
                            {c.fishType?.name || "Cá"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {Number(c.weight).toFixed(1)}kg × {Number(c.buybackPrice).toLocaleString()}đ/kg
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-orange-500">
                        -{Number(c.totalAmount).toLocaleString()}đ
                      </p>
                    </motion.div>
                  ))}

                  {/* Total Buyback */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tổng khấu trừ phiên
                    </span>
                    <span className="text-base font-black text-orange-500">
                      -{totalBuybackAmount.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
            <div className="pointer-events-auto space-y-4">
              {/* Summary Card */}
              {selectedFish && form.watch("weight") > 0 && (
                <BuybackSummary
                  fishLabel={selectedFish.name}
                  weight={form.watch("weight")}
                  pricePerKg={form.watch("pricePerKg")}
                  total={total}
                />
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-accent/50 hover:bg-accent transition-all active:scale-95"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !form.watch("fishTypeId") || form.watch("weight") <= 0}
                  className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-orange-500 text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Check size={20} strokeWidth={3} />
                  )}
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận thu mua"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
