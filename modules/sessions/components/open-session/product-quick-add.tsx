"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, ShoppingBag, Search, PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { productService } from "@/services/api/product-service";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductQuickAddProps {
  selectedProducts: { id: string, quantity: number, price: number, name?: string }[];
  onUpdate: (products: { id: string, quantity: number, price: number, name?: string }[]) => void;
}

export function ProductQuickAdd({ selectedProducts, onUpdate }: ProductQuickAddProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggle = (product: Product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    
    if (existing) {
      onUpdate(selectedProducts.filter(p => p.id !== product.id));
    } else {
      onUpdate([...selectedProducts, { id: product.id, quantity: 1, price, name: product.name }]);
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

  const handleQuickCreate = async () => {
    if (!search.trim()) return;
    
    setIsCreating(true);
    try {
      // Prompt for price or use a default
      const priceStr = prompt(`Nhập giá cho "${search}":`, "20000");
      if (priceStr === null) return;
      const price = parseFloat(priceStr);
      
      const newProduct = await productService.createProduct({
        name: search,
        price,
        categoryId: "cmp5ikhn00000w9ts0i0n76fh", // Default category created earlier
        stock: 100,
      } as any);

      if (!newProduct) throw new Error("Không nhận được thông tin sản phẩm mới");

      toast.success(`Đã tạo và thêm sản phẩm: ${search}`);
      await loadProducts();
      onUpdate([...selectedProducts, { id: newProduct.id, quantity: 1, price, name: search }]);
      setSearch("");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo sản phẩm");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const exactMatch = products.find(p => p.name.toLowerCase() === search.toLowerCase());

  if (isLoading) return (
    <div className="h-12 flex items-center justify-center bg-accent/30 rounded-xl">
      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-foreground font-bold">
            <ShoppingBag size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            Thêm sản phẩm / dịch vụ
          </h3>
        </div>
        
        <div className="relative w-full sm:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hoặc gõ tên thêm nhanh..."
            className="w-full h-12 pl-10 pr-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-xl outline-none font-bold text-sm transition-all"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {filteredProducts.map((product) => {
          const selected = selectedProducts.find(p => p.id === product.id);
          const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
          
          return (
            <div key={product.id} className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggle({ ...product, price })}
                className={cn(
                  "px-5 h-14 rounded-2xl font-black text-sm border-2 transition-all flex items-center gap-3 shadow-sm",
                  selected 
                    ? "border-primary bg-primary/10 text-primary dark:text-primary-foreground ring-2 ring-primary/20" 
                    : "border-slate-300 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-800 dark:text-slate-200"
                )}
              >
                {product.name}
                <span className={cn(
                  "font-black opacity-80 px-1.5 py-0.5 rounded text-[11px]",
                  selected ? "bg-primary/20 text-primary dark:text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300"
                )}>+{Math.round(price / 1000)}k</span>
              </button>
              
              {selected && (
                <div className="flex items-center justify-between bg-slate-200 dark:bg-zinc-700 rounded-xl p-1 border-2 border-slate-300 dark:border-zinc-600 animate-in zoom-in">
                  <button type="button" onClick={() => updateQuantity(product.id, -1)} className="p-2 hover:bg-slate-300 dark:hover:bg-zinc-650 rounded-lg text-slate-800 dark:text-slate-200 transition-colors"><Minus size={14}/></button>
                  <span className="text-xs font-black text-slate-900 dark:text-white px-2">{selected.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(product.id, 1)} className="p-2 hover:bg-slate-300 dark:hover:bg-zinc-650 rounded-lg text-slate-800 dark:text-slate-200 transition-colors"><Plus size={14}/></button>
                </div>
              )}
            </div>
          );
        })}

        {search && !exactMatch && (
          <button
            type="button"
            onClick={handleQuickCreate}
            disabled={isCreating}
            className="px-5 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-dashed border-primary bg-primary/5 text-primary flex items-center gap-2 hover:bg-primary/10 transition-all"
          >
            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            Tạo mới "{search}"
          </button>
        )}

        {products.length === 0 && !search && (
          <p className="text-xs italic text-slate-600 dark:text-slate-400 p-2">Chưa có sản phẩm nào. Hãy tìm kiếm để thêm mới.</p>
        )}
      </div>
    </div>
  );
}
