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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <ShoppingBag size={14} /> Thêm Sản phẩm
        </h3>
        
        <div className="relative flex-1 max-w-[200px] ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hoặc thêm mới..."
            className="w-full h-9 pl-9 pr-4 bg-accent/50 rounded-lg text-[10px] font-bold outline-none focus:ring-1 ring-primary/20 transition-all"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filteredProducts.map((product) => {
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

        {search && !exactMatch && (
          <button
            type="button"
            onClick={handleQuickCreate}
            disabled={isCreating}
            className="px-4 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-primary/30 text-primary flex items-center gap-2 hover:bg-primary/5 transition-all"
          >
            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            Thêm mới "{search}"
          </button>
        )}

        {products.length === 0 && !search && (
          <p className="text-[10px] italic text-muted-foreground">Chưa có sản phẩm nào. Hãy tìm kiếm để thêm mới.</p>
        )}
      </div>
    </div>
  );
}
