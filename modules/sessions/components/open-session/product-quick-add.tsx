"use client";

import React from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { cn } from "@/utils/utils";

interface Product {
  id: string;
  name: string;
  price: number;
}

const QUICK_PRODUCTS: Product[] = [
  { id: "v1", name: "Mồi Cám Xanh", price: 25000 },
  { id: "v2", name: "Mồi Giun Đỏ", price: 15000 },
  { id: "v3", name: "Nước Suối", price: 10000 },
  { id: "v4", name: "Bánh Mì", price: 15000 },
];

interface ProductQuickAddProps {
  selectedProducts: { id: string, quantity: number, price: number }[];
  onUpdate: (products: { id: string, quantity: number, price: number }[]) => void;
}

export function ProductQuickAdd({ selectedProducts, onUpdate }: ProductQuickAddProps) {
  const handleToggle = (product: Product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      onUpdate(selectedProducts.filter(p => p.id !== product.id));
    } else {
      onUpdate([...selectedProducts, { id: product.id, quantity: 1, price: product.price }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdate(selectedProducts.map(p => {
      if (p.id === id) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
        <ShoppingBag size={14} /> Thêm Sản phẩm (Tùy chọn)
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {QUICK_PRODUCTS.map((product) => {
          const selected = selectedProducts.find(p => p.id === product.id);
          return (
            <div key={product.id} className="flex flex-col gap-2">
              <button
                onClick={() => handleToggle(product)}
                className={cn(
                  "px-4 h-12 rounded-xl font-bold text-xs border-2 transition-all flex items-center gap-2",
                  selected 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-transparent bg-accent/50 text-muted-foreground"
                )}
              >
                {product.name}
                <span className="opacity-60">+{product.price / 1000}k</span>
              </button>
              
              {selected && (
                <div className="flex items-center justify-between bg-accent rounded-lg p-1 animate-in zoom-in">
                  <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-muted rounded"><Minus size={12}/></button>
                  <span className="text-[10px] font-black">{selected.quantity}</span>
                  <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-muted rounded"><Plus size={12}/></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
