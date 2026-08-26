"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, ShoppingBag, Search, PlusCircle, Loader2, CheckCircle2, X } from "lucide-react";
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState<number | string>(20000);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
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

  const handleCreateProduct = async () => {
    const name = (newProductName || search).trim();
    const price = Number(newProductPrice);

    if (!name) {
      toast.error("Vui lòng nhập tên sản phẩm / dịch vụ");
      return;
    }

    if (isNaN(price) || price <= 0) {
      toast.error("Vui lòng nhập đơn giá hợp lệ (> 0đ)");
      return;
    }
    
    setIsCreating(true);
    try {
      const newProduct = await productService.createProduct({
        name: name,
        price: price,
        categoryId: "",
        stock: 100,
      } as any);

      if (!newProduct) throw new Error("Không nhận được thông tin sản phẩm mới");

      toast.success(`Đã tạo và thêm sản phẩm: ${name} (${price.toLocaleString()}đ)`);
      await loadProducts();
      onUpdate([...selectedProducts, { id: newProduct.id, quantity: 1, price, name: name }]);
      setSearch("");
      setShowAddForm(false);
      setNewProductName("");
      setNewProductPrice(20000);
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo sản phẩm");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  const exactMatch = products.find(p => p.name.toLowerCase() === search.toLowerCase());

  if (isLoading) return (
    <div className="h-12 flex items-center justify-center bg-accent/30 rounded-xl">
      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-foreground font-bold">
            <ShoppingBag size={18} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            Dịch vụ & Đồ dùng kèm theo
          </h3>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:max-w-[320px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm hoặc thêm đồ..."
              className="w-full h-11 pl-9 pr-3 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-xl outline-none font-bold text-xs transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm && search) {
                setNewProductName(search);
              }
            }}
            className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 shadow-sm transition-all"
            title="Thêm mặt hàng mới"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Món mới</span>
          </button>
        </div>
      </div>

      {/* Form Tạo sản phẩm mới nhanh */}
      {showAddForm && (
        <div className="p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-emerald-500/30 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <PlusCircle size={14} />
              Thêm mặt hàng / dịch vụ mới vào hồ câu
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Tên sản phẩm / mồi câu / nước</label>
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Vd: Mồi cám xanh, Sting dâu, Bánh mì..."
                className="w-full h-10 px-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-700 outline-none font-bold text-xs text-slate-900 dark:text-white focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Đơn giá bán (VNĐ)</label>
              <input
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="20000"
                className="w-full h-10 px-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-700 outline-none font-bold text-xs text-slate-900 dark:text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 h-9 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreateProduct}
              disabled={isCreating}
              className="px-5 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isCreating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>Lưu & Thêm ngay</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Product Chips List */}
      <div className="flex flex-wrap gap-2.5">
        {filteredProducts.map((product) => {
          const selected = selectedProducts.find(p => p.id === product.id);
          const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
          
          return (
            <div key={product.id} className="flex flex-col gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleToggle({ ...product, price })}
                className={cn(
                  "px-4 h-12 rounded-xl font-bold text-xs border-2 transition-all flex items-center gap-2 shadow-xs",
                  selected 
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                    : "border-slate-300 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-800 dark:text-slate-200"
                )}
              >
                <span>{product.name}</span>
                <span className={cn(
                  "font-extrabold px-1.5 py-0.5 rounded text-[10px]",
                  selected ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200" : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300"
                )}>
                  +{Math.round(price / 1000)}k
                </span>
              </button>
              
              {selected && (
                <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-700 rounded-lg p-0.5 border border-slate-300 dark:border-zinc-600 animate-in zoom-in-95">
                  <button type="button" onClick={() => updateQuantity(product.id, -1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-600 rounded text-slate-700 dark:text-slate-300 transition-colors"><Minus size={12}/></button>
                  <span className="text-xs font-black text-slate-900 dark:text-white px-1.5">{selected.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(product.id, 1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-600 rounded text-slate-700 dark:text-slate-300 transition-colors"><Plus size={12}/></button>
                </div>
              )}
            </div>
          );
        })}

        {search && !exactMatch && (
          <button
            type="button"
            onClick={() => {
              setNewProductName(search);
              setShowAddForm(true);
            }}
            className="px-4 h-12 rounded-xl font-bold text-xs uppercase tracking-wider border-2 border-dashed border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-100/50 transition-all"
          >
            <PlusCircle size={14} />
            <span>+ Tạo món "{search}"</span>
          </button>
        )}

        {products.length === 0 && !search && !showAddForm && (
          <div className="p-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center w-full space-y-1">
            <p className="text-xs font-bold text-slate-500">Chưa có món hàng nào được tạo trong kho</p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              + Bấm vào đây để thêm món đầu tiên (Nước ngọt, mồi câu, thuốc lá...)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
