"use client";

import React from "react";
import { Plus, ShoppingCart, Tag } from "lucide-react";
import { cn } from "@/utils/utils";
import { Product } from "../types/product.types";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card group flex flex-col overflow-hidden rounded-[2rem] transition-all hover:scale-[1.02]"
    >
      {/* Product Image / Placeholder */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {product.thumbnail ? (
          <img 
            src={product.thumbnail} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
            <Tag size={64} strokeWidth={1} />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10">
          {product.category}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-black text-sm tracking-tight line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <InventoryStatusBadge stock={product.stock} />
        </div>

        <p className="text-xl font-black text-primary tracking-tighter mb-4">
          {product.price.toLocaleString()}đ
        </p>

        {/* Action Button */}
        <button
          onClick={() => onQuickAdd?.(product)}
          disabled={product.stock === 0}
          className={cn(
            "mt-auto h-12 w-full rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95",
            product.stock === 0 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
          )}
        >
          <Plus size={16} strokeWidth={3} />
          Thêm nhanh
        </button>
      </div>
    </motion.div>
  );
}
