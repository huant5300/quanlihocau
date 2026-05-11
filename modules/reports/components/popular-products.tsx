"use client";

import React from "react";
import { ShoppingBag, TrendingUp } from "lucide-react";

import type { PopularProduct } from "@/types";

interface PopularProductsProps {
  initialProducts?: PopularProduct[];
}

export function PopularProducts({ initialProducts = [] }: PopularProductsProps) {
  const displayProducts = initialProducts.length > 0 ? initialProducts : [];

  return (
    <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <ShoppingBag size={16} /> Bán chạy nhất
        </h3>
        <TrendingUp size={16} className="text-primary" />
      </div>

      <div className="space-y-4">
        {displayProducts.map((p, i) => (
          <div key={p.id || i} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-muted-foreground/50 w-4">0{i+1}</span>
              <p className="text-sm font-bold group-hover:text-primary transition-colors">{p.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black">{p.revenue.toLocaleString()}đ</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{p.sold_count} đã bán</p>
            </div>
          </div>
        ))}
        {displayProducts.length === 0 && (
          <p className="text-[10px] font-black uppercase text-muted-foreground text-center py-4 opacity-50">Không có dữ liệu</p>
        )}
      </div>

      <button className="w-full h-12 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
        Xem chi tiết
      </button>
    </div>
  );
}
