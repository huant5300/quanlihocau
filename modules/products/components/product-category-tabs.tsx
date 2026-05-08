"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { ProductCategory } from "../types/product.types";
import { motion } from "framer-motion";

const CATEGORIES: { id: ProductCategory | "All", label: string }[] = [
  { id: "All", label: "Tất cả" },
  { id: "Drinks", label: "Đồ uống" },
  { id: "Bait", label: "Mồi câu" },
  { id: "Food", label: "Đồ ăn" },
  { id: "Equipment", label: "Dụng cụ" },
];

interface ProductCategoryTabsProps {
  activeCategory: ProductCategory | "All";
  onSelect: (category: ProductCategory | "All") => void;
}

export function ProductCategoryTabs({ activeCategory, onSelect }: ProductCategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "relative h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap",
            activeCategory === cat.id 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          {activeCategory === cat.id && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
