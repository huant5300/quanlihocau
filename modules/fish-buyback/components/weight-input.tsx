"use client";

import React from "react";
import { Plus, Minus, Scale } from "lucide-react";
import { cn } from "@/utils/utils";

interface WeightInputProps {
  value: number;
  onChange: (val: number) => void;
}

const PRESETS = [0.5, 1, 2, 5, 10];

export function WeightInput({ value, onChange }: WeightInputProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
        <Scale size={14} /> Nhập khối lượng (KG)
      </h3>
      
      <div className="flex items-center gap-4 bg-accent/50 p-4 rounded-[2rem] border-2 border-transparent focus-within:border-primary/20 transition-all">
        <button 
          onClick={() => onChange(Math.max(0, value - 0.1))}
          className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center hover:bg-muted active:scale-90 transition-all shadow-sm"
        >
          <Minus size={24} />
        </button>
        
        <div className="flex-1 text-center">
          <input 
            type="number"
            step="0.1"
            value={value || ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent text-center text-4xl font-black tracking-tighter outline-none"
            placeholder="0.0"
          />
        </div>

        <button 
          onClick={() => onChange(value + 0.1)}
          className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="h-10 px-4 bg-accent hover:bg-primary/10 hover:text-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            +{p}kg
          </button>
        ))}
      </div>
    </div>
  );
}
