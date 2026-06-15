"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/api/product-service";
import { cn } from "@/utils/utils";

interface InventoryClientProps {
  products: any[];
}

export function InventoryClient({ products: initialProducts }: InventoryClientProps) {
  // Use React Query to fetch products list and auto-refetch in background every 5 seconds for real-time sync
  const { data: products = initialProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
    initialData: initialProducts,
    refetchInterval: 5000,
  });

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="pl-8 h-16 text-[10px] font-black uppercase tracking-widest">Sản phẩm</TableHead>
            <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Danh mục</TableHead>
            <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Giá bán</TableHead>
            <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-center">Tồn kho</TableHead>
            <TableHead className="h-16 pr-8 text-right text-[10px] font-black uppercase tracking-widest">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p: any) => {
            const isLowStock = p.stock <= (p.minStock ?? 5);
            return (
              <TableRow key={p.id} className="hover:bg-white/5 border-white/5">
                <TableCell className="pl-8 py-4">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{p.sku || "N/A"}</p>
                </TableCell>
                <TableCell className="text-sm font-medium">{p.category?.name || "Khác"}</TableCell>
                <TableCell className="text-sm font-black">{Number(p.price).toLocaleString()}đ</TableCell>
                <TableCell className="text-center">
                  <span className={cn("text-sm font-black", isLowStock ? "text-red-500" : "text-green-500")}>
                    {p.stock} {p.unit || "Cái"}
                  </span>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <Badge className={cn("border-none", isLowStock ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                    {isLowStock ? "Sắp hết hàng" : "Đủ hàng"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
