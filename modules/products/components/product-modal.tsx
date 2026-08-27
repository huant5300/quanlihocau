"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { productService } from "@/services/api/product-service";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductInsert } from "@/types";

export function ProductModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productService.getCategories(),
    enabled: isOpen,
    retry: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = (formData.get("name") as string || "").trim();
      const categoryId = formData.get("categoryId") as string;
      const price = Number(formData.get("price"));
      const stock = Number(formData.get("stock"));

      if (!name) {
        const err = "Vui lòng nhập tên sản phẩm / dịch vụ";
        setErrorMessage(err);
        toast.error(err, { position: "top-center", duration: 5000 });
        setIsSaving(false);
        return;
      }

      if (Number.isNaN(price) || price <= 0) {
        const err = "Đơn giá sản phẩm phải lớn hơn 0đ";
        setErrorMessage(err);
        toast.error(err, { position: "top-center", duration: 5000 });
        setIsSaving(false);
        return;
      }

      const product: ProductInsert = {
        name,
        categoryId,
        price,
        stock: Number.isNaN(stock) ? 0 : stock,
      };

      await productService.createProduct(product);
      toast.success(`Đã thêm sản phẩm "${name}" thành công! 🎉`, { position: "top-center" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setErrorMessage(null);
      setIsOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? "Không thể thêm sản phẩm, vui lòng thử lại";
      setErrorMessage(msg);
      toast.error(msg, { position: "top-center", duration: 6000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setErrorMessage(null);
    }}>
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
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập thông tin mặt hàng, giá bán và số lượng tồn kho.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in-50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
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
                name="categoryId"
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
              >
                <option value="">-- Không phân loại --</option>
                {categories.length > 0 ? (
                  categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Mồi câu">Mồi câu</option>
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Đồ ăn">Đồ ăn</option>
                    <option value="Dụng cụ">Dụng cụ</option>
                    <option value="Khác">Khác</option>
                  </>
                )}
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
