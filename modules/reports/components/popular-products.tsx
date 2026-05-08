"use client";

import React from "react";
import { ShoppingBag, TrendingUp } from "lucide-react";

const products = [
  { name: "Mồi Cám Xanh", sales: 450, revenue: "11.2Mđ" },
  { name: "Nước Suối 500ml", sales: 320, revenue: "3.2Mđ" },
  { name: "Mồi Giun Đỏ", sales: 210, revenue: "3.1Mđ" },
  { name: "Bánh Mì Kẹp", sales: 180, revenue: "2.7Mđ" },
];

export function PopularProducts() {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <ShoppingBag size={16} /> Bán chạy nhất
        </h3>
        <TrendingUp size={16} className="text-primary" />
      </div>

      <div className="space-y-4">
        {products.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-muted-foreground/50 w-4">0{i+1}</span>
              <p className="text-sm font-bold group-hover:text-primary transition-colors">{p.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black">{p.revenue}</p>
              <p className="text-[10px] font-bold text-muted-foreground">{p.sales} lượt</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full h-12 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
        Xem tất cả
      </button>
    </div>
  );
}
