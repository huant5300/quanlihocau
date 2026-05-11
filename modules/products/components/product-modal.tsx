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
import { Plus, Loader2 } from "lucide-react";
import { productService } from "@/services/api/product-service";
import { toast } from "sonner";
import type { ProductCategory, ProductInsert } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export function ProductModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name");
      const category = formData.get("category");
      const price = Number(formData.get("price"));
      const stock = Number(formData.get("stock"));

      if (typeof name !== "string" || typeof category !== "string" || Number.isNaN(price) || Number.isNaN(stock)) {
        toast.error("Dữ liệu sản phẩm không hợp lệ");
        setIsSaving(false);
        return;
      }

      const product: ProductInsert = {
        name,
        category: category as ProductCategory,
        price,
        stock,
        is_active: true,
      };

      await productService.createProduct(product);
      toast.success("Đã thêm sản phẩm mới");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Không thể thêm sản phẩm");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Plus size={20} strokeWidth={3} />
            <span>Thêm hàng mới</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tên sản phẩm</label>
            <input 
              name="name"
              required
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
              placeholder="Ví dụ: Mồi cám xanh"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Danh mục</label>
              <select 
                name="category"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
              >
                <option value="BAIT">Mồi câu</option>
                <option value="DRINK">Đồ uống</option>
                <option value="FOOD">Đồ ăn</option>
                <option value="EQUIPMENT">Dụng cụ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Đơn giá (đ)</label>
              <input 
                name="price"
                type="number"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="25000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số lượng tồn kho</label>
            <input 
              name="stock"
              type="number"
              required
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
              placeholder="100"
              defaultValue="100"
            />
          </div>

          <DialogFooter className="pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Lưu sản phẩm
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
