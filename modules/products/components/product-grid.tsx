"use client";

import React, { useState } from "react";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { Product } from "../types/product.types";
import { ProductCard } from "./product-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface ProductGridProps {
  products: Product[];
  onProductSelect?: (product: Product, quantity: number) => void;
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const categories = ["Tất cả", "Thức ăn", "Đồ uống", "Mồi câu", "Dụng cụ"];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "Tất cả" || 
      p.category === activeCategory || 
      (typeof p.category === 'object' && p.category && (p.category as any).name?.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (product: Product) => {
    const newQty = (cart[product.id] || 0) + 1;
    setCart({ ...cart, [product.id]: newQty });
    onProductSelect?.(product, newQty);
  };

  const handleRemove = (product: Product) => {
    if (!cart[product.id]) return;
    const newQty = cart[product.id] - 1;
    setCart({ ...cart, [product.id]: newQty });
    onProductSelect?.(product, newQty);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Cart Summary */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-card border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none shadow-sm transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 font-black">
          <ShoppingCart size={20} />
          <span>{Object.values(cart).reduce((a, b) => a + b, 0)} sản phẩm</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2",
              activeCategory === cat 
                ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                : "bg-card border-transparent text-muted-foreground hover:border-primary/20"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              quantity={cart[product.id]}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Filter size={32} />
          </div>
          <p className="font-bold text-muted-foreground">Không tìm thấy sản phẩm nào</p>
        </div>
      )}
    </div>
  );
}
