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

export function InventoryClient({ products }: any) {
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
          {products.map((p: any) => (
            <TableRow key={p.id} className="hover:bg-white/5 border-white/5">
              <TableCell className="pl-8 py-4">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{p.sku}</p>
              </TableCell>
              <TableCell className="text-sm font-medium">{p.category?.name}</TableCell>
              <TableCell className="text-sm font-black">{Number(p.price).toLocaleString()}đ</TableCell>
              <TableCell className="text-center">
                <span className={cn("text-sm font-black", p.stock <= p.minStock ? "text-red-500" : "text-green-500")}>
                  {p.stock} {p.unit}
                </span>
              </TableCell>
              <TableCell className="pr-8 text-right">
                <Badge className={p.stock <= p.minStock ? "bg-red-500/10 text-red-500 border-none" : "bg-green-500/10 text-green-500 border-none"}>
                  {p.stock <= p.minStock ? "Sắp hết hàng" : "Đủ hàng"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { cn } from "@/lib/utils";
