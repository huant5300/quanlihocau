"use client";

import React, { useState } from "react";
import { 
  X, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Box, 
  Check,
  Loader2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

interface AddProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductDrawer({ isOpen, onClose }: AddProductDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Đã thêm sản phẩm mới vào kho!");
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-md bg-card h-full shadow-2xl border-l flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b flex items-center justify-between">
            <h2 className="text-2xl font-black">Thêm Sản phẩm</h2>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            {/* Image Upload Placeholder */}
            <div className="aspect-video bg-muted/30 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center space-y-2 group cursor-pointer hover:border-primary/40 transition-all">
              <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <ImageIcon size={24} />
              </div>
              <p className="text-xs font-bold text-muted-foreground">Tải lên hình ảnh</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tên sản phẩm</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    placeholder="Ví dụ: Cám tổng hợp"
                    className="w-full h-14 pl-12 pr-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Giá bán</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="number"
                      placeholder="0"
                      className="w-full h-14 pl-12 pr-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tồn kho</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="number"
                      placeholder="0"
                      className="w-full h-14 pl-12 pr-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Danh mục</label>
                <select className="w-full h-14 px-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none cursor-pointer">
                  <option>Mồi câu</option>
                  <option>Thức ăn</option>
                  <option>Đồ uống</option>
                  <option>Dụng cụ</option>
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-8 border-t bg-muted/20">
            <button
              disabled={isSubmitting}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <><Check size={24} /> Lưu Sản phẩm</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
