"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, ShoppingBag, Search } from "lucide-react";
import { sessionService } from "@/services/api/session-service";
import { productService } from "@/services/api/product-service";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import type { Product, SessionProductInput } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface AddProductModalProps {
  sessionId: string;
  hutNumber: string;
}

export function AddProductModal({ sessionId, hutNumber }: AddProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Array<SessionProductInput & { name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm");
    }
  };

  const toggleProduct = (product: Product) => {
    const existing = selectedProducts.find(p => p.product_id === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.filter(p => p.product_id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }]);
    }
  };

  const removeSelectedProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.product_id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.product_id === productId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) return;
    setIsSaving(true);
    try {
      await sessionService.addProducts(sessionId, selectedProducts);
      toast.success("Đã thêm sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      setIsOpen(false);
      setSelectedProducts([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Không thể thêm sản phẩm");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="h-12 bg-accent/50 hover:bg-accent rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
          <Plus size={16} /> Thêm đồ
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-3">
            <ShoppingBag className="text-primary" />
            Thêm sản phẩm - Chòi {hutNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-accent/50 rounded-2xl outline-none font-bold focus:ring-2 ring-primary/20 transition-all"
              placeholder="Tìm kiếm sản phẩm..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Product Grid */}
            <div className="overflow-y-auto pr-2 space-y-2 no-scrollbar">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">Danh sách hàng</h4>
              {filteredProducts.map((p) => {
                const isSelected = selectedProducts.some(sp => sp.product_id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1",
                      isSelected ? "border-primary bg-primary/5" : "border-transparent bg-accent/30 hover:bg-accent/50"
                    )}
                  >
                    <p className="font-black text-xs uppercase tracking-tight">{p.name}</p>
                    <p className="text-[10px] font-bold text-primary">{p.price.toLocaleString()}đ</p>
                  </button>
                );
              })}
            </div>

            {/* Selection Column */}
            <div className="bg-accent/20 rounded-3xl p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Đã chọn ({selectedProducts.length})</h4>
              <div className="space-y-3 flex-1">
                {selectedProducts.map((p) => (
                  <div key={p.product_id} className="bg-background p-3 rounded-xl flex flex-col gap-2 shadow-sm border border-border/50">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{p.name}</p>
                      <button
                        onClick={() => removeSelectedProduct(p.product_id)}
                        className="text-[10px] font-black text-destructive uppercase"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(p.product_id, -1)} className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center font-bold">-</button>
                        <span className="text-xs font-black w-4 text-center">{p.quantity}</span>
                        <button onClick={() => updateQuantity(p.product_id, 1)} className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center font-bold">+</button>
                      </div>
                      <p className="text-xs font-black text-primary">{(p.price * p.quantity).toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
                {selectedProducts.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center p-8 border-2 border-dashed border-border/30 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Chưa chọn món nào</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Tạm tính</p>
                  <p className="text-lg font-black text-primary">
                    {selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button 
            onClick={handleSubmit}
            disabled={isSaving || selectedProducts.length === 0}
            className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <ShoppingBag size={20} />}
            Xác nhận thêm ({selectedProducts.length})
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
