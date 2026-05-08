"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { ProductGrid } from "@/modules/products/components/product-grid";
import { AddProductDrawer } from "@/modules/products/components/add-product-drawer";
import { Plus, Package } from "lucide-react";
import { Product } from "@/modules/products/components/product-card";

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Cám cá tra D1", price: 45000, stock: 20, category: "Mồi câu" },
  { id: "2", name: "Mồi xả tổng hợp", price: 65000, stock: 5, category: "Mồi câu" },
  { id: "3", name: "Nước suối Aquafina", price: 10000, stock: 48, category: "Đồ uống" },
  { id: "4", name: "Bò húc", price: 20000, stock: 0, category: "Đồ uống" },
  { id: "5", name: "Mì ly Modern", price: 15000, stock: 12, category: "Thức ăn" },
  { id: "6", name: "Lưỡi câu BKK", price: 85000, stock: 15, category: "Dụng cụ" },
  { id: "7", name: "Dây cước Shimano", price: 120000, stock: 3, category: "Dụng cụ" },
];

export default function ProductsPage() {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Package size={28} />
              <h1 className="text-3xl font-black tracking-tight">Kho Sản phẩm</h1>
            </div>
            <p className="text-muted-foreground">Quản lý hàng hóa, tồn kho và danh mục sản phẩm.</p>
          </div>

          <button 
            onClick={() => setIsAddDrawerOpen(true)}
            className="h-14 bg-primary text-white px-8 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={24} /> Thêm Sản phẩm
          </button>
        </div>

        {/* Product Grid Container */}
        <section className="bg-muted/10 p-6 md:p-10 rounded-[3rem] border-2 border-border/50">
          <ProductGrid products={MOCK_PRODUCTS} />
        </section>
      </div>

      {/* Drawer */}
      <AddProductDrawer 
        isOpen={isAddDrawerOpen} 
        onClose={() => setIsAddDrawerOpen(false)} 
      />
    </MainLayout>
  );
}
