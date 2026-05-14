"use client";

import React from "react";
import { 
  X,
  Play,
  Printer,
  User,
  MapPin,
  Clock,
  Loader2
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

  const currentHutId = form.watch("hut_id");
  const currentPackageId = form.watch("package_id");
  const currentName = form.watch("customer_name");
  const currentPhone = form.watch("phone_number");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="relative w-full max-w-5xl h-[95vh] sm:h-auto max-h-[90vh] bg-card border border-border shadow-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-black uppercase tracking-tight">Mở lượt câu mới</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                  Quản lí hồ câu, dể gì đâu !
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center hover:bg-accent transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto no-scrollbar flex-1">
            {/* Guidance Bar */}
            <div className="px-8 py-3 bg-white/5 border-b border-white/10 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <p className="text-[10px] font-bold tracking-[0.05em] text-white">
                {!currentPhone || !currentName ? "bước 1: nhập sđt hoặc tên khách hàng" : 
                 !currentHutId ? "bước 2: chọn ô số (chòi) đang trống" :
                 !currentPackageId ? "bước 3: chọn gói thời gian khách muốn câu" :
                 "bước cuối: thêm dịch vụ (nếu có) và nhấn 'bắt đầu phiên'"}
              </p>
            </div>

            <div className="p-8 space-y-10">
              {/* Customer Section */}
              <div className="space-y-4">
                <CustomerSearch 
                  phone={form.watch("phone_number")}
                  name={form.watch("customer_name")}
                  onPhoneChange={(val) => form.setValue("phone_number", val)}
                  onNameChange={(val) => form.setValue("customer_name", val)}
                />
              </div>

              {/* Lake Configuration Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground">
                      <MapPin size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Vị trí</h3>
                  </div>
                  <HutSelector 
                    selectedId={form.watch("hut_id")} 
                    onSelect={(id) => form.setValue("hut_id", id)} 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Gói câu</h3>
                  </div>
                  <PackageSelector 
                    selectedId={form.watch("package_id")} 
                    onSelect={(id) => form.setValue("package_id", id)} 
                  />
                </div>
              </div>

              {/* Products Section */}
              <div className="space-y-4">
                <ProductQuickAdd 
                  selectedProducts={form.watch("products")}
                  onUpdate={(products) => form.setValue("products", products)}
                />
              </div>

              {/* Payment & Summary */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tiền tạm thu (VNĐ)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={form.watch("prepaid_amount") || ""}
                      onChange={(e) => form.setValue("prepaid_amount", Number(e.target.value))}
                      className="w-full h-16 px-6 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-black text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">In hóa đơn</label>
                    <button 
                      onClick={() => form.setValue("should_print", !form.watch("should_print"))}
                      className={cn(
                        "w-full h-16 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px]",
                        form.watch("should_print") 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-transparent bg-accent/50 text-muted-foreground"
                      )}
                    >
                      <Printer size={18} />
                      {form.watch("should_print") ? "Có in bill" : "Không in bill"}
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
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-8 border-t border-border/50 bg-card/80 backdrop-blur-md grid grid-cols-2 gap-4">
            <button 
              onClick={onClose}
              className="h-14 sm:h-16 rounded-2xl bg-accent/50 font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleStartSession}
              disabled={isLoading}
              className="h-14 sm:h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
              Bắt đầu phiên
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
