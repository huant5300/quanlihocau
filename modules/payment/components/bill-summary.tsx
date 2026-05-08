"use client";

import React from "react";
import { BillData } from "../types/payment.types";
import { Package, ShoppingBag, Fish, Calculator } from "lucide-react";

interface BillSummaryProps {
  bill: BillData;
}

export function BillSummary({ bill }: BillSummaryProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chi tiết hóa đơn</h3>
      
      <div className="space-y-4">
        {/* Session Fee */}
        <div className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-primary" />
            <span className="text-sm font-bold">Gói câu cá (Hồ {bill.hutNumber})</span>
          </div>
          <p className="font-black text-sm">{bill.sessionFee.toLocaleString()}đ</p>
        </div>

        {/* Products */}
        {bill.products.length > 0 && (
          <div className="p-4 bg-accent/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <ShoppingBag size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Sản phẩm & Dịch vụ</span>
            </div>
            {bill.products.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs font-bold pl-7">
                <p>{item.name} x{item.quantity}</p>
                <p>{(item.price * item.quantity).toLocaleString()}đ</p>
              </div>
            ))}
          </div>
        )}

        {/* Buyback */}
        {bill.buybackDeduction > 0 && (
          <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <Fish size={18} className="text-orange-500" />
              <span className="text-sm font-bold">Khấu trừ thu mua cá</span>
            </div>
            <p className="font-black text-sm text-orange-500">-{bill.buybackDeduction.toLocaleString()}đ</p>
          </div>
        )}
      </div>
    </div>
  );
}
