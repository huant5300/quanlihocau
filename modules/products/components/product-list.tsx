"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { ProductCard } from "./product-card";
import { ProductCategoryTabs } from "./product-category-tabs";
import { Product, ProductCategory } from "../types/product.types";
import { ProductEmptyState } from "./product-empty-state";
import { motion, AnimatePresence } from "framer-motion";

interface ProductListProps {
  initialProducts: Product[];
}

export function ProductList({ initialProducts }: ProductListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, search, category]);

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
