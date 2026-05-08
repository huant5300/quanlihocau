"use client";

import React from "react";
import { Plus, Minus, Package, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { Skeleton } from "@/components/skeletons/skeleton";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
  quantity?: number;
}

export function ProductCard({ product, onAdd, onRemove, quantity = 0 }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-card rounded-[2rem] border-2 transition-all duration-300 overflow-hidden flex flex-col group relative",
        quantity > 0 ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border/50 hover:border-primary/20"
      )}
    >
      {/* Stock Badge */}
      <div className="absolute top-4 left-4 z-10">
        {isOutOfStock ? (
          <span className="bg-destructive text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Hết hàng</span>
        ) : isLowStock ? (
          <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
            <AlertTriangle size={10} /> Chỉ còn {product.stock}
          </span>
        ) : null}
      </div>

      {/* Image / Thumbnail */}
      <div className="aspect-square bg-muted/30 relative flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
        ) : (
          <Package size={48} className="text-muted-foreground/20" />
        )}
        
        {/* Quantity Overlay */}
        {quantity > 0 && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl">
              {quantity}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-1">
        <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
        <p className="text-primary font-black text-lg">{product.price.toLocaleString()}đ</p>
      </div>

      {/* Actions */}
      <div className="p-3 pt-0 mt-auto grid grid-cols-2 gap-2">
        <button
          onClick={() => onRemove?.(product)}
          disabled={quantity <= 0}
          className="h-12 bg-accent/50 rounded-xl flex items-center justify-center hover:bg-accent active:scale-90 transition-all disabled:opacity-30"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={() => onAdd?.(product)}
          disabled={isOutOfStock}
          className="h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-primary/20 active:scale-90 transition-all disabled:opacity-50"
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
}
