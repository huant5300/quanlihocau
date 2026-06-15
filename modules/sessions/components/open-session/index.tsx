"use client";

import React, { useState, useEffect } from "react";
import { 
  X,
  Play,
  User,
  MapPin,
  Clock,
  Loader2,
  Printer,
  AlertTriangle
} from "lucide-react";
import { useOpenSession } from "../../hooks/use-open-session";
import { CustomerSearch } from "./customer-search";
import { HutSelector } from "./hut-selector";
import { PackageSelector } from "./package-selector";
import { TimePicker } from "./time-picker";
import { ProductQuickAdd } from "./product-quick-add";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getActiveShiftSession } from "@/actions/shift-actions";
import { useSession } from "next-auth/react";
import { ManagerOverrideModal } from "@/components/shared/manager-override-modal";
import { useRouter } from "next/navigation";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenSessionModal({ isOpen, onClose }: OpenSessionModalProps) {
  const { form, onSubmit, isLoading, packages } = useOpenSession();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const { data: authSession } = useSession();
  const router = useRouter();

  // Query active shift
  const { data: activeShift, isLoading: isLoadingShift } = useQuery({
    queryKey: ["active-shift"],
    queryFn: async () => {
      const res = await getActiveShiftSession();
      if (res.success) return res.data;
      throw new Error(res.error);
    },
    enabled: isOpen,
  });

  // Reset advanced settings when opening the modal
  useEffect(() => {
    if (isOpen) {
      setShowAdvanced(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const watchedPackageId = form.watch("package_id");
  const watchedIsCustom = form.watch("is_custom_package");
  const watchedCustomHours = form.watch("custom_hours");
  const watchedCustomPrice = form.watch("custom_price");

  const selectedDuration = (() => {
    if (watchedPackageId === "custom" || watchedIsCustom) {
      return watchedCustomHours || 0;
    }
    const pkg = packages.find(p => p.id === watchedPackageId);
    return pkg ? Number(pkg.durationHours) : 0;
  })();

  const handleStartSession = async () => {
    // Validate required fields
    const isValid = await form.trigger(["start_time", "package_id", "hut_id"]);
    if (isValid) {
      const userRole = authSession?.user?.role;
      const isStaffOrCashier = userRole === "STAFF" || userRole === "CASHIER";
      const isCustom = watchedPackageId === "custom" || watchedIsCustom;

      if (isCustom && isStaffOrCashier) {
        setIsOverrideOpen(true);
      } else {
        const success = await onSubmit(form.getValues());
        if (success) onClose();
      }
    } else {
      const errors = form.formState.errors;
      // Show first validation error message
      if (errors.package_id?.message) {
        toast.error(errors.package_id.message);
      } else if (errors.hut_id?.message) {
        toast.error(errors.hut_id.message);
      } else if (errors.start_time?.message) {
        toast.error(errors.start_time.message);
      } else {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      }
    }
  };

  const handleOverrideApproved = async (credentials: { username: string; password?: string }) => {
    const success = await onSubmit(form.getValues(), credentials);
    if (success) {
      setIsOverrideOpen(false);
      onClose();
    }
  };

  // 1. Show loader while checking shift session
  if (isLoadingShift) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // 2. Show Warning Screen if there's no active shift session
  if (!activeShift) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col z-10 p-8 text-center items-center"
          >
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Chưa mở ca làm việc</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-8">
              Hệ thống yêu cầu phải bắt đầu ca làm việc trước khi thực hiện mở lượt câu mới cho khách để đối soát dòng tiền chính xác.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={onClose}
                className="h-12 bg-accent hover:bg-accent/80 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  onClose();
                  router.push("/dashboard/shifts");
                }}
                className="h-12 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                Mở ca trực ngay
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop - Blurred Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Centered Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Tạo vé & Mở lượt câu</h2>
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-0.5">
                Thiết kế 1 màn hình - 3 chạm nhanh chóng
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto no-scrollbar flex-1 p-6 sm:p-8 space-y-6">
            
            {/* Flat Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (Customer & Time) - 5 Cols */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Customer Search */}
                <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/40 rounded-3xl border border-border/60">
                  <CustomerSearch 
                    phone={form.watch("phone_number") || ""}
                    name={form.watch("customer_name") || ""}
                    onPhoneChange={(val) => form.setValue("phone_number", val)}
                    onNameChange={(val) => form.setValue("customer_name", val)}
                    onCustomerSelect={(customerId) => form.setValue("customer_id", customerId)}
                  />
                </div>

                {/* 2. Start Time Picker */}
                <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/40 rounded-3xl border border-border/60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold">
                      <Clock size={20} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Giờ Bắt Đầu</h3>
                  </div>
                  <TimePicker
                    value={form.watch("start_time") || ""}
                    onChange={(val) => form.setValue("start_time", val)}
                    durationHours={selectedDuration || undefined}
                  />
                </div>
              </div>

              {/* Right Column (Package & Hut) - 7 Cols */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 3. Package Selection */}
                <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/40 rounded-3xl border border-border/60">
                  <PackageSelector 
                    selectedId={form.watch("package_id")} 
                    onSelect={(id) => {
                      form.setValue("package_id", id);
                      if (id !== "custom") {
                        form.setValue("is_custom_package", false);
                        form.setValue("custom_hours", undefined);
                        form.setValue("custom_price", undefined);
                      } else {
                        form.setValue("is_custom_package", true);
                        if (!form.getValues("custom_hours")) {
                          form.setValue("custom_hours", 1);
                        }
                        if (!form.getValues("custom_price")) {
                          form.setValue("custom_price", 50000);
                        }
                      }
                    }} 
                  />

                  {/* Custom Package Inputs Inline */}
                  {watchedPackageId === "custom" && (
                    <div className="mt-4 p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl grid grid-cols-2 gap-4 border border-border/80 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">Số giờ câu</label>
                        <input 
                          type="number"
                          min="1"
                          placeholder="Số giờ"
                          value={form.watch("custom_hours") || ""}
                          onChange={(e) => {
                            const hours = Number(e.target.value);
                            form.setValue("custom_hours", hours);
                            form.setValue("is_custom_package", true);
                          }}
                          className="w-full h-12 px-4 bg-white dark:bg-zinc-900 rounded-xl border border-border outline-none font-black text-sm focus:border-primary text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">Giá vé (VNĐ)</label>
                        <input 
                          type="number"
                          placeholder="Nhập đơn giá"
                          value={form.watch("custom_price") || ""}
                          onChange={(e) => {
                            const price = Number(e.target.value);
                            form.setValue("custom_price", price);
                            form.setValue("is_custom_package", true);
                          }}
                          className="w-full h-12 px-4 bg-white dark:bg-zinc-900 rounded-xl border border-border outline-none font-black text-sm focus:border-primary text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Hut Selection */}
                <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/40 rounded-3xl border border-border/60">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold">
                      <MapPin size={20} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Chọn Vị Trí Ô Câu</h3>
                  </div>
                  <HutSelector 
                    selectedId={form.watch("hut_id")} 
                    onSelect={(id) => form.setValue("hut_id", id)} 
                  />
                </div>

                {/* 5. Product Quick Add */}
                <div className="p-5 bg-slate-50/50 dark:bg-zinc-900/40 rounded-3xl border border-border/60">
                  <ProductQuickAdd
                    selectedProducts={form.watch("products") || []}
                    onUpdate={(val) => form.setValue("products", val)}
                  />
                </div>

              </div>

            </div>

            {/* Advanced Configurations Toggle (Print & Prepaid) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 ml-2"
              >
                <span>{showAdvanced ? "[-] Ẩn thiết lập phụ" : "[+] Hiện thiết lập phụ (Tạm thu, In hóa đơn)"}</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 p-5 bg-slate-50/30 dark:bg-zinc-900/20 border border-dashed border-border rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tiền tạm thu (VNĐ)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={form.watch("prepaid_amount") || ""}
                      onChange={(e) => form.setValue("prepaid_amount", Number(e.target.value))}
                      className="w-full h-14 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-border outline-none font-black text-sm focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tự động in hóa đơn</label>
                    <button 
                      onClick={() => form.setValue("should_print", !form.watch("should_print"))}
                      type="button"
                      className={cn(
                        "w-full h-14 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs",
                        form.watch("should_print") 
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "border-border bg-card text-muted-foreground"
                      )}
                    >
                      <Printer size={16} />
                      {form.watch("should_print") ? "Có in bill" : "Không in bill"}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer CTA Button - Height >= 56px */}
          <div className="p-6 sm:p-8 border-t border-border/50 bg-card/85 backdrop-blur-md flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="h-14 px-8 rounded-2xl bg-accent font-black uppercase tracking-widest text-[11px] hover:bg-accent/80 transition-all active:scale-95 whitespace-nowrap"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleStartSession}
              disabled={isLoading}
              className="h-14 flex-1 sm:flex-none sm:px-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang tạo vé...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Tạo vé & Mở lượt câu</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Manager Override Modal */}
        <ManagerOverrideModal 
          isOpen={isOverrideOpen}
          onClose={() => setIsOverrideOpen(false)}
          onApproved={handleOverrideApproved}
        />
      </div>
    </AnimatePresence>
  );
}
