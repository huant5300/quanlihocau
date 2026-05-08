"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { Clock, Zap } from "lucide-react";

interface Package {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  isPopular?: boolean;
}

const MOCK_PACKAGES: Package[] = [
  { id: "p1", name: "Gói 2 Giờ", duration: 120, price: 150000 },
  { id: "p2", name: "Gói 4 Giờ", duration: 240, price: 250000, isPopular: true },
  { id: "p3", name: "Gói 6 Giờ", duration: 360, price: 350000 },
  { id: "p4", name: "Gói Cả Ngày", duration: 720, price: 500000 },
];

interface PackageSelectorProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function PackageSelector({ selectedId, onSelect }: PackageSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Gói Câu</h3>
      <div className="grid grid-cols-1 gap-3">
        {MOCK_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => onSelect(pkg.id)}
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between border-2 transition-all relative overflow-hidden group min-h-[64px]",
              selectedId === pkg.id 
                ? "border-primary bg-primary/10" 
                : "border-transparent bg-accent/50 hover:bg-accent"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                selectedId === pkg.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}>
                <Clock size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm tracking-tight">{pkg.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{pkg.duration / 60} Giờ thi đấu</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-black text-lg text-primary tracking-tighter">
                {pkg.price.toLocaleString()}đ
              </p>
            </div>

            {pkg.isPopular && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[8px] font-black text-white rounded-bl-xl uppercase tracking-widest">
                Phổ biến
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
