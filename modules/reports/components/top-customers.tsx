"use client";

import React from "react";
import { Users, Trophy } from "lucide-react";

const customers = [
  { name: "Nguyễn Hoàng Nam", visits: 42, total: "12.5Mđ" },
  { name: "Trần Minh Tâm", visits: 28, total: "8.4Mđ" },
  { name: "Lê Thị Hồng", visits: 12, total: "3.2Mđ" },
];

export function TopCustomers() {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Users size={16} /> Top Khách hàng
        </h3>
        <Trophy size={16} className="text-yellow-500" />
      </div>

      <div className="space-y-4">
        {customers.map((c, i) => (
          <div key={c.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                {c.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold group-hover:text-primary transition-colors">{c.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{c.visits} Phiên câu</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-primary">{c.total}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full h-12 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
        Xem danh sách
      </button>
    </div>
  );
}
