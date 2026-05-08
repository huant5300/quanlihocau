"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { ProductList } from "@/modules/products/components/product-list";
import { Plus, Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Sản phẩm & Kho" 
          subtitle="Quản lý hàng hóa, dịch vụ và tồn kho tại hồ câu."
          actions={
            <button className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus size={20} strokeWidth={3} />
              <span>Thêm hàng mới</span>
            </button>
          }
        />
      }
    >
      <div className="space-y-10">
        {/* Quick Inventory Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng mặt hàng</p>
              <h4 className="text-xl font-black">124</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 border-orange-500/20">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sắp hết hàng</p>
              <h4 className="text-xl font-black text-orange-500">12</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 border-destructive/20">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Đã hết hàng</p>
              <h4 className="text-xl font-black text-destructive">5</h4>
            </div>
          </div>
        </div>

        {/* Product List Section */}
        <ProductList />
      </div>
    </DashboardLayout>
  );
}
