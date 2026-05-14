"use client";

import React from "react";
import { 
  X,
  Play,
  Printer,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useOpenSession } from "../../hooks/use-open-session";
import { CustomerSearch } from "./customer-search";
import { HutSelector } from "./hut-selector";
import { PackageSelector } from "./package-selector";
import { ProductQuickAdd } from "./product-quick-add";
import { SessionSummary } from "./session-summary";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenSessionModal({ isOpen, onClose }: OpenSessionModalProps) {
  const { form, onSubmit, isLoading, packages } = useOpenSession();

  if (!isOpen) return null;

  const handleStartSession = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const success = await onSubmit(form.getValues());
      if (success) onClose();
    }
  };

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
          className="relative w-full max-w-2xl bg-background rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Mở lượt câu mới</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Hệ thống POS thông minh</p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center hover:bg-accent transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
            <CustomerSearch 
              phone={form.watch("phone_number")}
              name={form.watch("customer_name")}
              onPhoneChange={(val) => form.setValue("phone_number", val)}
              onNameChange={(val) => form.setValue("customer_name", val)}
            />

            <HutSelector 
              selectedId={form.watch("hut_id")}
              onSelect={(id) => form.setValue("hut_id", id)}
            />

            <PackageSelector 
              selectedId={form.watch("package_id")}
              onSelect={(id) => form.setValue("package_id", id)}
            />

            <ProductQuickAdd 
              selectedProducts={form.watch("products")}
              onUpdate={(products) => form.setValue("products", products)}
            />
          </div>

          {/* Footer Footer */}
          <div className="p-8 border-t border-border/50 bg-card/80 backdrop-blur-md space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tiền tạm thu (vnđ)</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={form.watch("prepaid_amount") || ""}
                  onChange={(e) => form.setValue("prepaid_amount", Number(e.target.value))}
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">In hóa đơn</label>
                <button
                  type="button"
                  onClick={() => form.setValue("should_print", !form.watch("should_print"))}
                  className={cn(
                    "w-full h-14 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold",
                    form.watch("should_print") 
                      ? "border-primary/20 bg-primary/10 text-primary" 
                      : "border-transparent bg-accent/50 text-muted-foreground"
                  )}
                >
                  <Printer size={18} />
                  {form.watch("should_print") ? "Có in bill" : "Không in"}
                </button>
              </div>
            </div>

            <SessionSummary 
              total={(() => {
                const pkgId = form.watch("package_id");
                const products = form.watch("products") || [];
                const productsTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                
                const selectedPkg = packages.find(p => p.id === pkgId);
                const packagePrice = selectedPkg ? Number(selectedPkg.price) : 0;
                return packagePrice + productsTotal;
              })()} 
              prepaid={form.watch("prepaid_amount") || 0}
            />

            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-accent/50 hover:bg-accent transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isLoading}
                onClick={handleStartSession}
                className={cn(
                  "flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20",
                  isLoading ? "bg-muted cursor-not-allowed" : "bg-primary text-white"
                )}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    Bắt đầu phiên
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
