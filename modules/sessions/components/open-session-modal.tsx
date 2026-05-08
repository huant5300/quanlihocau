"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  User, 
  Hash, 
  Clock, 
  ShoppingBag, 
  Printer, 
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openSessionSchema, OpenSessionInput } from "../schemas/open-session.schema";
import { PrinterService } from "@/lib/printer/printer-service";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenSessionModal({ isOpen, onClose }: OpenSessionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<OpenSessionInput>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      products: []
    }
  });

  const phoneNumber = watch("phone_number");

  useEffect(() => {
    if (phoneNumber === "0912345678") {
      setIsReturningCustomer(true);
      setValue("customer_name", "Nguyễn Văn A");
      toast.success("Hệ thống nhận diện: Khách quen!", {
        icon: <Zap className="text-yellow-500" />
      });
    } else {
      setIsReturningCustomer(false);
    }
  }, [phoneNumber, setValue]);

  const onSubmit = async (data: OpenSessionInput) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Mở lượt câu thành công!");
    setIsSubmitting(false);
    reset();
    onClose();
  };

  const handlePrintTicket = async () => {
    const data = watch();
    if (!data.hut_id || !data.customer_name) {
      toast.error("Vui lòng nhập đủ thông tin để in vé.");
      return;
    }
    await PrinterService.printTicket({
      hut_number: data.hut_id,
      customer_name: data.customer_name
    });
  };

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
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-card rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          <div className="p-6 md:p-8 border-b flex items-center justify-between bg-muted/30">
            <div>
              <h2 className="text-2xl font-black">Mở lượt câu mới</h2>
              <p className="text-sm text-muted-foreground">Nhập thông tin để bắt đầu phiên câu cá.</p>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-accent transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <User size={18} className="font-bold" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Thông tin khách hàng</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      {...register("phone_number")}
                      placeholder="Số điện thoại"
                      className={cn(
                        "w-full h-14 pl-12 pr-4 bg-accent/30 rounded-2xl border-2 outline-none transition-all font-bold",
                        errors.phone_number ? "border-destructive/50" : "border-transparent focus:border-primary/20"
                      )}
                    />
                  </div>
                  {errors.phone_number && <p className="text-xs text-destructive font-medium pl-2">{errors.phone_number.message}</p>}
                </div>
                <div className="space-y-2">
                  <input 
                    {...register("customer_name")}
                    placeholder="Tên khách hàng"
                    className={cn(
                      "w-full h-14 px-4 bg-accent/30 rounded-2xl border-2 outline-none transition-all font-bold",
                      errors.customer_name ? "border-destructive/50" : "border-transparent focus:border-primary/20",
                      isReturningCustomer && "text-primary"
                    )}
                  />
                  {errors.customer_name && <p className="text-xs text-destructive font-medium pl-2">{errors.customer_name.message}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Hash size={18} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Chọn Chòi</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["01", "02", "03", "04", "05", "06", "07", "08"].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setValue("hut_id", h)}
                      className={cn(
                        "h-12 rounded-xl font-bold transition-all border-2",
                        watch("hut_id") === h 
                          ? "bg-primary border-primary text-white" 
                          : "bg-accent/30 border-transparent hover:border-primary/20"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Clock size={18} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Gói câu</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { id: "p1", name: "Câu giờ (40k/h)", desc: "Tính theo thời gian thực" },
                    { id: "p2", name: "Ca sáng (200k)", desc: "06:00 - 12:00" },
                    { id: "p3", name: "Ca chiều (200k)", desc: "12:00 - 18:00" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setValue("package_id", p.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center justify-between",
                        watch("package_id") === p.id 
                          ? "bg-primary/5 border-primary shadow-sm" 
                          : "bg-accent/30 border-transparent hover:border-primary/20"
                      )}
                    >
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{p.desc}</p>
                      </div>
                      {watch("package_id") === p.id && <CheckCircle2 size={18} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShoppingBag size={18} />
                <h3 className="font-bold uppercase tracking-widest text-xs">Sản phẩm nhanh</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Cám câu", "Mồi xả", "Nước suối", "Bò húc"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="p-3 bg-accent/30 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all text-xs font-bold flex items-center justify-between"
                  >
                    {item}
                    <Plus size={14} className="text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </form>

          <div className="p-6 md:p-8 bg-muted/30 border-t grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handlePrintTicket}
              className="h-14 bg-accent/50 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all"
            >
              <Printer size={20} /> In vé tạm
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <><Play size={20} /> Bắt đầu câu</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
