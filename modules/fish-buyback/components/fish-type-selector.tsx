"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { FishType, FISH_TYPES } from "../types/buyback.types";
import { motion } from "framer-motion";

interface FishTypeSelectorProps {
  selectedType: FishType;
  onSelect: (type: FishType, defaultPrice: number) => void;
}

export function FishTypeSelector({ selectedType, onSelect }: FishTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn loại cá</h3>
      <div className="grid grid-cols-2 gap-3">
        {FISH_TYPES.map((fish) => (
          <motion.button
            key={fish.type}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(fish.type, fish.defaultPrice)}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
              selectedType === fish.type 
                ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                : "border-transparent bg-accent/50 text-muted-foreground"
            )}
          >
            <span className="font-black text-sm uppercase tracking-tight">{fish.label}</span>
            <span className="text-[10px] font-bold opacity-60">
              {fish.defaultPrice.toLocaleString()}đ/kg
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
