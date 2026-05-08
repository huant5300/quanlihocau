"use client";

import React from "react";
import { PackageSearch, Plus } from "lucide-react";

export function ProductEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass-card rounded-[3rem] border-dashed border-border/50">
      <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-muted-foreground mb-6">
        <PackageSearch size={40} />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight">Không tìm thấy sản phẩm</h3>
      <p className="text-sm text-muted-foreground font-bold mt-2 max-w-[250px]">
        Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
      </p>
      <button
        className="mt-8 h-14 px-8 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={20} strokeWidth={3} />
        <span>Thêm sản phẩm mới</span>
      </button>
    </div>
  );
}
