"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCustomerAction } from "@/actions/customer-actions";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

export function CustomerModal() {
  const { isCustomerModalOpen: isOpen, setCustomerModalOpen: setIsOpen } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string || "").trim();
    const phone = (formData.get("phone") as string || "").trim();
    const address = (formData.get("address") as string || "").trim();

    if (!fullName || !phone) {
      const err = "Vui lòng nhập đầy đủ Họ tên và Số điện thoại";
      setErrorMessage(err);
      toast.error(err, { position: "top-center" });
      setIsSubmitting(false);
      return;
    }

    const result = await createCustomerAction({ fullName, phone, address });
    
    if (result.success) {
      toast.success(`Đã thêm hội viên "${fullName}" thành công! 🎉`, { position: "top-center" });
      setErrorMessage(null);
      setIsOpen(false);
      router.refresh();
    } else {
      const err = result.error || "Không thể thêm khách hàng, vui lòng thử lại";
      setErrorMessage(err);
      toast.error(err, { position: "top-center", duration: 6000 });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setErrorMessage(null);
    }}>
      <DialogTrigger asChild>
        <button className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          <UserPlus size={20} strokeWidth={3} />
          <span>Thêm hội viên</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">Đăng ký hội viên</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in-50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và tên</label>
            <input 
              name="fullName"
              required
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</label>
              <input 
                name="phone"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="0901234567"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Địa chỉ (tùy chọn)</label>
              <input 
                name="address"
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="Quận/Huyện, Tỉnh/TP"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              Lưu thông tin
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
