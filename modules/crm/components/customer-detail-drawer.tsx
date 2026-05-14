"use client";

import React, { useState } from "react";
import { 
  X, 
  Waves, 
  History,
  TrendingUp,
  Trash2,
  Edit2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Customer } from "@prisma/client";
import { updateCustomerAction, deleteCustomerAction } from "@/actions/customer-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, isOpen, onClose }: CustomerDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!customer) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (fullName && phone) {
      const result = await updateCustomerAction(customer.id, { fullName, phone, address });
      if (result.success) {
        toast.success("Đã cập nhật thông tin");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể cập nhật");
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này? Mọi dữ liệu liên quan có thể bị mất.")) {
      setIsSubmitting(true);
      const result = await deleteCustomerAction(customer.id);
      if (result.success) {
        toast.success("Đã xóa khách hàng");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Không thể xóa khách hàng");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end p-0 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />

          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-xl h-full bg-background shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-primary/30">
                  {customer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{customer.fullName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-muted-foreground">{customer.phone || "Không có số điện thoại"}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center hover:bg-muted transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              {isEditing ? (
                <form id="edit-customer-form" onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và tên</label>
                    <input 
                      name="fullName"
                      defaultValue={customer.fullName}
                      required
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</label>
                    <input 
                      name="phone"
                      defaultValue={customer.phone}
                      required
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Địa chỉ</label>
                    <input 
                      name="address"
                      defaultValue={customer.address || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    />
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card p-6 rounded-[2rem] space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp size={14} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Tổng chi tiêu</p>
                      </div>
                      <h4 className="text-2xl font-black text-primary tracking-tighter">
                        {Number(customer.totalSpent ?? 0).toLocaleString()}đ
                      </h4>
                    </div>
                    <div className="glass-card p-6 rounded-[2rem] space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Waves size={14} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Tần suất ghé</p>
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter">
                        {customer.visitCount ?? 0} <span className="text-sm">phiên</span>
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <History size={14} /> Hoạt động gần đây
                    </h3>
                    <p className="text-[10px] font-black uppercase text-muted-foreground text-center py-4 opacity-50 border-2 border-dashed border-border/30 rounded-2xl">
                      Chưa có lịch sử hoạt động
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-border/50 bg-card/80 backdrop-blur-md flex flex-col gap-4">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-14 rounded-2xl bg-accent font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    form="edit-customer-form"
                    disabled={isSubmitting}
                    className="h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Lưu"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 h-14 rounded-2xl bg-accent font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Chỉnh sửa
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex-1 h-14 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} 
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
