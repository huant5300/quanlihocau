"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { cn } from "@/utils/utils";
import { productService } from "@/services/api/product-service";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductQuickAddProps {
  selectedProducts: { id: string, quantity: number, price: number }[];
  onUpdate: (products: { id: string, quantity: number, price: number }[]) => void;
}

export function ProductQuickAdd({ selectedProducts, onUpdate }: ProductQuickAddProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productService.getProducts();
        // Take first 4 or common products as "Quick Add"
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

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

  if (isLoading) return (
    <div className="h-12 flex items-center justify-center bg-accent/30 rounded-xl">
      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
        <ShoppingBag size={14} /> Thêm Sản phẩm (Tùy chọn)
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {products.map((product) => {
          const selected = selectedProducts.find(p => p.id === product.id);
          const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
          
          return (
            <div key={product.id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleToggle({ ...product, price })}
                className={cn(
                  "px-4 h-12 rounded-xl font-bold text-xs border-2 transition-all flex items-center gap-2",
                  selected 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-transparent bg-accent/50 text-muted-foreground"
                )}
              >
                {product.name}
                <span className="opacity-60">+{Math.round(price / 1000)}k</span>
              </button>
              
              {selected && (
                <div className="flex items-center justify-between bg-accent rounded-lg p-1 animate-in zoom-in">
                  <button type="button" onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-muted rounded"><Minus size={12}/></button>
                  <span className="text-[10px] font-black">{selected.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-muted rounded"><Plus size={12}/></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
