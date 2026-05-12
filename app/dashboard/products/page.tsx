"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { ProductList } from "@/modules/products/components/product-list";
import { Package } from "lucide-react";
import { ProductSkeleton } from "@/modules/products/components/product-skeleton";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/api/product-service";
import { ProductModal } from "@/modules/products/components/product-modal";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  const outOfStockProducts = products.filter((p: any) => (p.stock || 0) === 0).length;

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Sản phẩm & Kho" 
          subtitle="Quản lý hàng hóa, dịch vụ và tồn kho tại hồ câu."
          actions={<ProductModal />}
        />
      }
    >
      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <div className="space-y-10">
          {/* Quick Inventory Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng mặt hàng</p>
                <h4 className="text-xl font-black">{totalProducts}</h4>
              </div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 border-orange-500/20">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sắp hết hàng</p>
                <h4 className="text-xl font-black text-orange-500">{lowStockProducts}</h4>
              </div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 border-destructive/20">
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Đã hết hàng</p>
                <h4 className="text-xl font-black text-destructive">{outOfStockProducts}</h4>
              </div>
            </div>
          </div>

          {/* Product List Section */}
          <ProductList initialProducts={products} />
        </div>
      )}
    </DashboardLayout>
  );
}
