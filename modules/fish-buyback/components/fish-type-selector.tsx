"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { Fish, Loader2 } from "lucide-react";

interface FishTypeFromDB {
  id: string;
  name: string;
  buybackPrice: number;
  image?: string;
}

interface FishTypeSelectorProps {
  fishTypes: FishTypeFromDB[];
  selectedTypeId: string;
  isLoading?: boolean;
  onSelect: (fishTypeId: string, buybackPrice: number) => void;
}

export function FishTypeSelector({ fishTypes, selectedTypeId, isLoading, onSelect }: FishTypeSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn loại cá</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      </div>
    );
  }

  if (fishTypes.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn loại cá</h3>
        <div className="bg-accent/30 rounded-2xl p-6 border border-dashed border-border text-center">
          <Fish size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-[11px] font-bold text-muted-foreground">
            Chưa có loại cá nào. Vui lòng thêm loại cá trong mục <strong>Cài đặt &gt; Quản lý loại cá</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn loại cá</h3>
      <div className="grid grid-cols-2 gap-3">
        {fishTypes.map((fish) => (
          <motion.button
            key={fish.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(fish.id, Number(fish.buybackPrice))}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
              selectedTypeId === fish.id
                ? "border-orange-500 bg-orange-500/10 text-orange-600 shadow-lg shadow-orange-500/20"
                : "border-transparent bg-accent/50 text-muted-foreground hover:bg-accent"
            )}
          >
            <span className="font-black text-sm uppercase tracking-tight">{fish.name}</span>
            <span className="text-[10px] font-bold opacity-60">
              {Number(fish.buybackPrice).toLocaleString()}đ/kg
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
