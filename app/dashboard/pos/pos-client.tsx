"use client";

import React, { useState, useMemo } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { posService } from "@/services/api/pos-service";
import { useRouter } from "next/navigation";

export function POSClient({ products, categories }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.includes(search);
      const matchCategory = activeCategory === "all" || p.categoryId === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const result = await posService.checkout({
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        paymentMethod: paymentMethod === "CASH" ? "CASH" : "TRANSFER",
      });

      toast.success("Thanh toán thành công!");
      setCart([]);
      router.refresh(); // Refresh to update stock levels in UI
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex gap-8 overflow-hidden">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Tìm sản phẩm (Tên, Mã SKU)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10"
            />
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          <Button 
            onClick={() => setActiveCategory("all")}
            variant={activeCategory === "all" ? "default" : "outline"}
            className="rounded-full px-6 whitespace-nowrap h-10 font-bold"
          >
            Tất cả
          </Button>
          {categories.map((cat: any) => (
            <Button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className="rounded-full px-6 whitespace-nowrap h-10 font-bold"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p: any) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(p)}
                className="glass-card p-4 rounded-3xl cursor-pointer hover:border-primary/50 transition-all border-white/5"
              >
                <div className="aspect-square bg-white/5 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={32} className="text-muted-foreground opacity-30" />
                  )}
                  {p.stock <= p.minStock && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white border-none text-[8px] px-2 py-0.5">Sắp hết</Badge>
                  )}
                </div>
                <h4 className="text-sm font-bold truncate mb-1">{p.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{p.unit}</p>
                <p className="text-base font-black text-primary">{Number(p.price).toLocaleString()}đ</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-[450px] bg-card/20 backdrop-blur-2xl rounded-[3rem] border border-white/5 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShoppingCart size={22} />
            </div>
            <h3 className="font-black text-xl tracking-tight uppercase">Giỏ hàng</h3>
          </div>
          <Badge className="bg-primary text-white rounded-full px-3 py-1 font-black">{cart.length}</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 gap-4">
                <ShoppingCart size={64} />
                <p className="font-bold text-sm uppercase tracking-widest">Giỏ hàng trống</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{Number(item.price).toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white/10 rounded-lg"><Minus size={14} /></button>
                    <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white/10 rounded-lg"><Plus size={14} /></button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-black/20 border-t border-white/5 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-muted-foreground">
              <span className="text-sm font-medium">Tạm tính</span>
              <span className="text-sm font-bold">{totalAmount.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-lg font-black uppercase tracking-tight">Tổng tiền</span>
              <span className="text-2xl font-black text-primary">{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={paymentMethod === "TRANSFER" ? "default" : "outline"} 
              onClick={() => setPaymentMethod("TRANSFER")}
              className="h-14 rounded-2xl border-white/10 flex items-center gap-2 font-bold"
            >
              <CreditCard size={18} />
              Chuyển khoản
            </Button>
            <Button 
              variant={paymentMethod === "CASH" ? "default" : "outline"}
              onClick={() => setPaymentMethod("CASH")}
              className="h-14 rounded-2xl border-white/10 flex items-center gap-2 font-black uppercase text-xs"
            >
              <Banknote size={18} />
              Tiền mặt
            </Button>
          </div>
          
          <Button 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            className="w-full h-16 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            {isSubmitting ? "Đang xử lý..." : "Thanh toán & In hóa đơn"}
          </Button>
        </div>
      </div>
    </div>
  );
}
