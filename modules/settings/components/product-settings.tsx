"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Search,
  Check,
  AlertTriangle,
  FileText,
  Tag
} from "lucide-react";
import { productService } from "@/services/api/product-service";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/utils/utils";

export function ProductSettings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productService.getCategories(),
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const categoryId = formData.get("categoryId") as string;
      const price = Number(formData.get("price"));
      const costPrice = formData.get("costPrice") ? Number(formData.get("costPrice")) : null;
      const stock = Number(formData.get("stock"));
      const minStock = Number(formData.get("minStock") || 5);
      const unit = (formData.get("unit") as string) || "Cái";
      const sku = formData.get("sku") as string || null;
      const barcode = formData.get("barcode") as string || null;
      const description = formData.get("description") as string || null;
      const isActive = formData.get("isActive") === "true";

      if (!name || !categoryId || Number.isNaN(price)) {
        toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
        setIsSaving(false);
        return;
      }

      const productData: any = {
        name,
        categoryId,
        price,
        costPrice,
        stock,
        minStock,
        unit,
        sku,
        barcode,
        description,
        isActive,
      };

      if (editingProduct) {
        // Remove stock from update payload to prevent direct manipulation unless via transactions, 
        // but let them update it here if they want. The backend update supports it.
        await productService.updateProduct(editingProduct.id, productData);
        toast.success("Đã cập nhật sản phẩm thành công");
      } else {
        await productService.createProduct(productData);
        toast.success("Đã tạo sản phẩm mới thành công");
      }

      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Lịch sử kho và hóa đơn có thể bị ảnh hưởng.")) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Đã xóa sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Quản Lý Sản Phẩm & Dịch Vụ" 
        description="Thêm mới, cập nhật giá bán, số lượng tồn kho và thông tin hàng hóa bán tại hồ."
        icon={ShoppingBag}
      >
        <div className="space-y-6">
          {/* Search and Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold text-sm transition-all"
              />
            </div>
            <button 
              onClick={handleOpenAdd}
              className="h-12 px-6 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
              <Plus size={16} strokeWidth={3} />
              Thêm sản phẩm
            </button>
          </div>

          {/* Product List */}
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-medium uppercase text-[10px] tracking-widest bg-accent/10 rounded-[2rem] border border-dashed border-border">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((p: any) => {
                const isLowStock = p.stock <= p.minStock;
                const categoryName = p.category?.name || categories.find((c: any) => c.id === p.categoryId)?.name || "Khác";

                return (
                  <div 
                    key={p.id}
                    className={cn(
                      "p-5 bg-accent/20 border rounded-[2rem] flex items-center justify-between group hover:bg-accent/40 transition-all duration-300",
                      !p.isActive ? "opacity-60 border-transparent" : isLowStock ? "border-red-500/20" : "border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        isLowStock ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                      )}>
                        {isLowStock ? <AlertTriangle size={20} /> : <Tag size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-sm uppercase tracking-tight truncate">{p.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>{categoryName}</span>
                          <span>•</span>
                          <span className={cn(isLowStock && "text-red-500 font-black")}>
                            Tồn: {p.stock} {p.unit}
                          </span>
                          {p.sku && (
                            <>
                              <span>•</span>
                              <span>SKU: {p.sku}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-sm text-primary">{Number(p.price).toLocaleString()}đ</p>
                        <span className={cn(
                          "inline-block mt-0.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                          p.isActive ? "bg-green-500/10 text-green-500" : "bg-zinc-500/10 text-zinc-500"
                        )}>
                          {p.isActive ? "Bán hàng" : "Ngừng bán"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="p-2.5 bg-background hover:bg-primary/10 hover:text-primary rounded-xl transition-all border border-border/50"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2.5 bg-background hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all border border-border/50"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add / Edit Dialog */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-xl rounded-[2.5rem] overflow-y-auto max-h-[90vh] no-scrollbar">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tên sản phẩm *</label>
                    <input 
                      name="name"
                      required
                      defaultValue={editingProduct?.name || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="Ví dụ: Nước suối Aquafina"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Danh mục *</label>
                    <select 
                      name="categoryId"
                      required
                      defaultValue={editingProduct?.categoryId || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
                    >
                      <option value="" disabled>-- Chọn danh mục --</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="cat_bait">Mồi câu</option>
                          <option value="cat_drink">Đồ uống</option>
                          <option value="cat_food">Đồ ăn</option>
                          <option value="cat_equipment">Dụng cụ</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Đơn vị tính *</label>
                    <input 
                      name="unit"
                      required
                      defaultValue={editingProduct?.unit || "Cái"}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="Chai, Lon, Gói, Cái..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Đơn giá bán * (đ)</label>
                    <input 
                      name="price"
                      type="number"
                      required
                      defaultValue={editingProduct?.price || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="15000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giá vốn mua vào (đ)</label>
                    <input 
                      name="costPrice"
                      type="number"
                      defaultValue={editingProduct?.costPrice || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số lượng tồn kho ban đầu</label>
                    <input 
                      name="stock"
                      type="number"
                      required
                      defaultValue={editingProduct?.stock ?? 0}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tồn kho tối thiểu (Cảnh báo)</label>
                    <input 
                      name="minStock"
                      type="number"
                      required
                      defaultValue={editingProduct?.minStock ?? 5}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mã SKU</label>
                    <input 
                      name="sku"
                      defaultValue={editingProduct?.sku || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="SP-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mã Barcode</label>
                    <input 
                      name="barcode"
                      defaultValue={editingProduct?.barcode || ""}
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                      placeholder="893000..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mô tả sản phẩm</label>
                  <textarea 
                    name="description"
                    defaultValue={editingProduct?.description || ""}
                    rows={2}
                    className="w-full p-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold text-sm resize-none"
                    placeholder="Mô tả công dụng hoặc đặc điểm của sản phẩm..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Trạng thái bán hàng</label>
                  <select 
                    name="isActive"
                    defaultValue={editingProduct?.isActive ?? "true"}
                    className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
                  >
                    <option value="true">Đang kinh doanh (Active)</option>
                    <option value="false">Ngừng kinh doanh (Inactive)</option>
                  </select>
                </div>

                <DialogFooter className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />)}
                    {editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SettingsCard>
    </div>
  );
}
