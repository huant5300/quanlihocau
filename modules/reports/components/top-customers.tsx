"use client";

import React from "react";
import { Users, Trophy } from "lucide-react";

import type { TopCustomer } from "@/types";

interface TopCustomersProps {
  initialCustomers?: TopCustomer[];
}

export function TopCustomers({ initialCustomers = [] }: TopCustomersProps) {
  const displayCustomers = initialCustomers.length > 0 ? initialCustomers : [];

  return (
    <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Users size={16} /> Top Khách hàng
        </h3>
        <Trophy size={16} className="text-yellow-500" />
      </div>

      <div className="space-y-4">
        {displayCustomers.map((c, i) => (
          <div key={c.id || i} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                {c.full_name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold group-hover:text-primary transition-colors">{c.full_name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{c.visit_count} Phiên câu</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-primary">{c.total_spent.toLocaleString()}đ</p>
            </div>
          </div>
        ))}
        {displayCustomers.length === 0 && (
          <p className="text-[10px] font-black uppercase text-muted-foreground text-center py-4 opacity-50">Không có dữ liệu</p>
        )}
      </div>

      <button className="w-full h-12 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
        Xem danh sách
      </button>
    </div>
  );
}
