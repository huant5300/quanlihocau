"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

interface Hut {
  id: string;
  name: string;
  isAvailable: boolean;
}

const MOCK_HUTS: Hut[] = [
  { id: "1", name: "Chòi 01", isAvailable: true },
  { id: "2", name: "Chòi 02", isAvailable: false },
  { id: "3", name: "Chòi 03", isAvailable: true },
  { id: "4", name: "Chòi 04", isAvailable: true },
  { id: "5", name: "Chòi 05", isAvailable: true },
  { id: "6", name: "Chòi 06", isAvailable: false },
  { id: "7", name: "Chòi 07", isAvailable: true },
  { id: "8", name: "Chòi 08", isAvailable: true },
];

interface HutSelectorProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function HutSelector({ selectedId, onSelect }: HutSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Chòi / Vị trí</h3>
      <div className="grid grid-cols-4 gap-2">
        {MOCK_HUTS.map((hut) => (
          <motion.button
            key={hut.id}
            whileTap={hut.isAvailable ? { scale: 0.9 } : {}}
            onClick={() => hut.isAvailable && onSelect(hut.id)}
            disabled={!hut.isAvailable}
            className={cn(
              "h-14 rounded-xl font-black text-sm flex items-center justify-center border-2 transition-all",
              !hut.isAvailable && "opacity-30 grayscale cursor-not-allowed border-transparent bg-muted",
              selectedId === hut.id 
                ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                : "border-transparent bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            {hut.name.split(" ")[1]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
