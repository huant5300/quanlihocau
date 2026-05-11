"use client";

import React from "react";
import { 
  User, 
  Phone, 
  ChevronRight,
  Star
} from "lucide-react";
import type { Customer } from "@/types";

interface CustomerTableProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
}

export function CustomerTable({ customers, onSelect }: CustomerTableProps) {
  return (
    <div className="bg-card rounded-[2.5rem] border-2 border-border/50 overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden md:grid grid-cols-5 p-6 bg-muted/30 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <div className="col-span-2">Khách hàng</div>
        <div>Lượt câu</div>
        <div>Tổng chi tiêu</div>
        <div className="text-right">Hành động</div>
      </div>

      {/* List / Table Body */}
      <div className="divide-y divide-border/50">
        {customers.map((customer) => (
          <div 
            key={customer.id}
            onClick={() => onSelect(customer)}
            className="grid grid-cols-1 md:grid-cols-5 p-4 md:p-6 items-center gap-4 hover:bg-accent/30 transition-colors cursor-pointer group"
          >
            {/* Info */}
            <div className="col-span-2 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {customer.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base">{customer.full_name}</h4>
                  {customer.total_spent > 5000000 && (
                    <span className="bg-yellow-500/10 text-yellow-600 p-1 rounded-lg">
                      <Star size={12} fill="currentColor" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Phone size={12} />
                  <span>{customer.phone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Visits (Desktop) */}
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-black">{customer.visit_count} lượt</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Tham gia: {new Date(customer.created_at).toLocaleDateString("vi-VN")}</span>
            </div>

            {/* Spent (Desktop) */}
            <div className="hidden md:block">
              <span className="text-sm font-black text-primary">{customer.total_spent.toLocaleString()}đ</span>
            </div>

            {/* Mobile Footer / Desktop Action */}
            <div className="flex md:block items-center justify-between md:text-right mt-2 md:mt-0">
              <div className="md:hidden flex flex-col">
                <span className="text-xs text-muted-foreground">Tổng chi tiêu</span>
                <span className="text-sm font-black text-primary">{customer.total_spent.toLocaleString()}đ</span>
              </div>
              <button className="p-2 rounded-xl bg-accent group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
