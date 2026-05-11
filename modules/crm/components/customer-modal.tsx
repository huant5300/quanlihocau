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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/api/customer-service";
import type { CustomerInsert } from "@/types";

import { useUIStore } from "@/stores/ui-store";

export function CustomerModal() {
  const { isCustomerModalOpen: isOpen, setCustomerModalOpen: setIsOpen } = useUIStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newCustomer: CustomerInsert) => customerService.createCustomer(newCustomer),
    onSuccess: () => {
      toast.success("Đã thêm hội viên mới");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể thêm khách hàng");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("full_name");
    const phone = formData.get("phone");
    const address = formData.get("address");

    if (typeof fullName !== "string" || typeof phone !== "string") {
      toast.error("Thông tin khách hàng không hợp lệ");
      return;
    }

    const customer: CustomerInsert = {
      full_name: fullName,
      phone,
      address: typeof address === "string" ? address : undefined,
    };

    mutation.mutate(customer);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và tên</label>
            <input 
              name="full_name"
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
              disabled={mutation.isPending}
              className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              Lưu thông tin
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
