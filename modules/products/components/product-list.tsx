"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { ProductCard } from "./product-card";
import { ProductCategoryTabs } from "./product-category-tabs";
import { Product, ProductCategory } from "../types/product.types";
import { ProductEmptyState } from "./product-empty-state";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Mồi Cám Xanh Siêu Nhạy", category: "Bait", price: 25000, stock: 45, isActive: true },
  { id: "2", name: "Nước khoáng Aquafina 500ml", category: "Drinks", price: 10000, stock: 120, isActive: true },
  { id: "3", name: "Cần câu Shimano Carbon", category: "Equipment", price: 1250000, stock: 3, isActive: true },
  { id: "4", name: "Mồi Giun Đỏ (Hộp)", category: "Bait", price: 15000, stock: 0, isActive: true },
  { id: "5", name: "Mì tôm trứng đặc biệt", category: "Food", price: 35000, stock: 50, isActive: true },
  { id: "6", name: "Coca Cola Lon", category: "Drinks", price: 15000, stock: 8, isActive: true },
];

export function ProductList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold"
          />
        </div>
        
        <ProductCategoryTabs activeCategory={category} onSelect={setCategory} />
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <ProductEmptyState />
        )}
      </AnimatePresence>
    </div>
  );
}
