"use client";

import React, { useState, useEffect } from "react";
import { 
  X,
  Play,
  Printer,
  User,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2
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
import { toast } from "sonner";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getStepInstructions = (step: number) => {
  switch (step) {
    case 1:
      return {
        line1: "NHẬP SỐ ĐIỆN THOẠI HOẶC TÌM KIẾM THEO TÊN ĐỂ ÁP DỤNG THÀNH VIÊN PHÙ HỢP.",
        line2: "BẤM TIẾP TỤC ĐỂ BỎ QUA NẾU ĐÂY LÀ KHÁCH LẺ KHÔNG CẦN LƯU THÔNG TIN."
      };
    case 2:
      return {
        line1: "CHỌN MỘT Ô CÂU CÒN TRỐNG (MÀU XANH) DÀNH CHO KHÁCH HÀNG TRÊN SƠ ĐỒ.",
        line2: "KHÔNG CHỌN CÁC Ô ĐANG CÓ MÀU ĐỎ VÌ ĐANG CÓ PHIÊN CÂU ĐANG HOẠT ĐỘNG."
      };
    case 3:
      return {
        line1: "CHỌN GÓI CÂU THỜI GIAN THEO DANH SÁCH HOẶC CHỌN GÓI TỰ NHẬP ĐỂ TÙY CHỈNH.",
        line2: "HỆ THỐNG SẼ TỰ ĐỘNG TÍNH TOÁN TIỀN TẠM THU VÀ THỜI GIAN KẾT THÚC DỰ KIẾN."
      };
    case 4:
    default:
      return {
        line1: "THÊM DỊCH VỤ ĂN UỐNG NẾU KHÁCH CÓ MUA THÊM VÀ ĐIỀN TIỀN TẠM THU.",
        line2: "CHỌN TRẠNG THÁI IN HÓA ĐƠN VÀ BẤM BẮT ĐẦU PHIÊN ĐỂ HOÀN TẤT QUY TRÌNH."
      };
  }
};

export function OpenSessionModal({ isOpen, onClose }: OpenSessionModalProps) {
  const { form, onSubmit, isLoading, packages } = useOpenSession();
  const [currentStep, setCurrentStep] = useState(1);

  // Reset to step 1 when opening the modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["phone_number", "customer_name"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["hut_id"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["package_id"];
      if (form.getValues("package_id") === "custom") {
        fieldsToValidate.push("custom_hours", "custom_price");
      }
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      const errors = form.formState.errors;
      const firstError = fieldsToValidate
        .map((field) => errors[field as keyof typeof errors])
        .find((err) => !!err);
      if (firstError?.message) {
        toast.error(firstError.message as string);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStartSession = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const success = await onSubmit(form.getValues());
      if (success) onClose();
    } else {
      const errors = form.formState.errors;
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error(firstError.message as string);
      }
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
                  Quản lí hồ câu, dễ gì đâu !
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
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between px-8 py-4 bg-slate-50/50 dark:bg-zinc-900/40 border-b border-black/5 dark:border-white/5">
              {[
                { label: "Khách hàng", icon: User },
                { label: "Vị trí", icon: MapPin },
                { label: "Gói câu", icon: Clock },
                { label: "Hoàn tất", icon: Play },
              ].map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                const StepIcon = step.icon;
                
                return (
                  <React.Fragment key={stepNum}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                        isActive 
                          ? "bg-primary text-white scale-110 shadow-md shadow-primary/20" 
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                      )}>
                        {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                      </div>
                      <span className={cn(
                        "hidden sm:inline text-[10px] font-black uppercase tracking-wider",
                        isActive ? "text-slate-900 dark:text-white" : "text-slate-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-2 transition-all",
                        currentStep > stepNum ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-800"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Instruction Banner - 2 lines of white small text */}
            {(() => {
              const instructions = getStepInstructions(currentStep);
              return (
                <div className="mx-8 mt-6 bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-4 border border-white/10 shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 animate-pulse shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Hướng dẫn</p>
                    <p className="text-[11px] leading-relaxed text-white font-bold tracking-wide">{instructions.line1}</p>
                    <p className="text-[11px] leading-relaxed text-zinc-300 font-medium tracking-wide">{instructions.line2}</p>
                  </div>
                </div>
              );
            })()}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-8 space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <CustomerSearch 
                      phone={form.watch("phone_number") || ""}
                      name={form.watch("customer_name") || ""}
                      onPhoneChange={(val) => form.setValue("phone_number", val)}
                      onNameChange={(val) => form.setValue("customer_name", val)}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground">
                        <MapPin size={18} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Vị trí</h3>
                    </div>
                    <HutSelector 
                      selectedId={form.watch("hut_id")} 
                      onSelect={(id) => {
                        form.setValue("hut_id", id);
                        // Auto-advance or keep it manual. The instruction tells the user to select hut, then click next.
                      }} 
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
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

                    {currentPackageId === "custom" && (
                      <div className="mt-4 p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl grid grid-cols-2 gap-4 border-2 border-slate-300 dark:border-zinc-700 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 ml-1">Số giờ câu</label>
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
                            className="w-full h-14 px-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-slate-300 dark:border-zinc-700 outline-none font-black text-base focus:border-primary text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 ml-1">Tổng tiền ca (VNĐ)</label>
                          <input 
                            type="number"
                            placeholder="Nhập giá vé"
                            value={form.watch("custom_price") || ""}
                            onChange={(e) => {
                              const price = Number(e.target.value);
                              form.setValue("custom_price", price);
                              form.setValue("is_custom_package", true);
                            }}
                            className="w-full h-14 px-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-slate-300 dark:border-zinc-700 outline-none font-black text-base focus:border-primary text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Products Section */}
                    <div className="space-y-4">
                      <ProductQuickAdd 
                        selectedProducts={form.watch("products")}
                        onUpdate={(products) => form.setValue("products", products)}
                      />
                    </div>

                    {/* Payment & Summary */}
                    <div className="pt-8 border-t border-black/5 dark:border-white/5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 ml-1">Tiền tạm thu (VNĐ)</label>
                          <input 
                            type="number"
                            placeholder="0"
                            value={form.watch("prepaid_amount") || ""}
                            onChange={(e) => form.setValue("prepaid_amount", Number(e.target.value))}
                            className="w-full h-16 px-6 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-black text-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 ml-1">In hóa đơn</label>
                          <button 
                            onClick={() => form.setValue("should_print", !form.watch("should_print"))}
                            type="button"
                            className={cn(
                              "w-full h-16 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs",
                              form.watch("should_print") 
                                ? "border-primary bg-primary/10 text-primary dark:text-primary-foreground shadow-sm" 
                                : "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300"
                            )}
                          >
                            <Printer size={20} />
                            {form.watch("should_print") ? "Có in bill" : "Không in bill"}
                          </button>
                        </div>
                      </div>

                      <SessionSummary 
                        total={(() => {
                          const pkgId = form.watch("package_id");
                          const products = form.watch("products") || [];
                          const productsTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                          
                          if (pkgId === "custom") {
                            const customPrice = form.watch("custom_price") || 0;
                            return Number(customPrice) + productsTotal;
                          }
                          const selectedPkg = packages.find(p => p.id === pkgId);
                          const packagePrice = selectedPkg ? Number(selectedPkg.price) : 0;
                          return packagePrice + productsTotal;
                        })()} 
                        prepaid={form.watch("prepaid_amount") || 0}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-8 border-t border-border/50 bg-card/80 backdrop-blur-md grid grid-cols-2 gap-4">
            {currentStep === 1 ? (
              <button 
                onClick={onClose}
                className="h-14 sm:h-16 rounded-2xl bg-accent/50 font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all"
              >
                Hủy bỏ
              </button>
            ) : (
              <button 
                onClick={handlePrevStep}
                className="h-14 sm:h-16 rounded-2xl bg-accent/50 font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all"
              >
                Quay lại
              </button>
            )}

            {currentStep < 4 ? (
              <button 
                onClick={handleNextStep}
                className="h-14 sm:h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Tiếp tục
              </button>
            ) : (
              <button 
                onClick={handleStartSession}
                disabled={isLoading}
                className="h-14 sm:h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                Bắt đầu phiên
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
