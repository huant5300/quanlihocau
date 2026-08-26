"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { ProductList } from "@/modules/products/components/product-list";
import { Package, FileDown } from "lucide-react";
import { ProductSkeleton } from "@/modules/products/components/product-skeleton";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/api/product-service";
import { ProductModal } from "@/modules/products/components/product-modal";
import { exportToExcel } from "@/utils/export-excel";
import { exportToPDF } from "@/utils/export-pdf";
import { toast } from "sonner";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  const outOfStockProducts = products.filter((p: any) => (p.stock || 0) === 0).length;

  const handleExportExcel = () => {
    if (products.length === 0) return toast.error("Không có sản phẩm nào để xuất");
    const data = products.map((p: any, i: number) => ({
      "STT": i + 1,
      "Tên mặt hàng": p.name,
      "Danh mục": typeof p.category === 'object' ? p.category?.name : (p.category || "Chưa phân loại"),
      "Đơn giá (VNĐ)": Number(p.price || 0),
      "Tồn kho": Number(p.stock || 0),
      "Trạng thái": (p.stock || 0) === 0 ? "Hết hàng" : (p.stock || 0) <= 10 ? "Sắp hết" : "Còn hàng"
    }));
    exportToExcel(data, `danh_sach_san_pham_kho`);
    toast.success("Xuất danh sách sản phẩm Excel thành công!");
  };

  const handleExportPDF = () => {
    if (products.length === 0) return toast.error("Không có sản phẩm nào để xuất");
    const headers = ["STT", "Tên mặt hàng", "Danh mục", "Đơn giá", "Tồn kho", "Trạng thái"];
    const rows = products.map((p: any, i: number) => [
      i + 1, 
      p.name, 
      typeof p.category === 'object' ? p.category?.name : (p.category || "Khác"),
      Number(p.price || 0).toLocaleString() + "đ",
      p.stock || 0,
      (p.stock || 0) === 0 ? "Hết hàng" : (p.stock || 0) <= 10 ? "Sắp hết" : "Còn hàng"
    ]);
    exportToPDF({
      title: "Báo cáo Sản phẩm & Tồn kho",
      headers,
      rows,
      filename: "danh_sach_san_pham_kho"
    });
    toast.success("Xuất PDF thành công!");
  };

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Sản phẩm & Kho" 
          subtitle="Quản lý hàng hóa, dịch vụ và tồn kho tại hồ câu."
          actions={
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportExcel}
                className="h-14 px-4 bg-accent/60 hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95"
              >
                <FileDown size={16} />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>

              <button 
                onClick={handleExportPDF}
                className="h-14 px-4 bg-accent/60 hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95"
              >
                <FileDown size={16} />
                <span className="hidden sm:inline">Xuất PDF</span>
              </button>

              <ProductModal />
            </div>
          }
        />
      }
    >
      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <div className="space-y-8">
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
