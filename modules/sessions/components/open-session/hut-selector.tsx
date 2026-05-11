"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { settingsService } from "@/services/api/settings-service";

interface HutSelectorProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function HutSelector({ selectedId, onSelect }: HutSelectorProps) {
  const [huts, setHuts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHuts() {
      try {
        const data = await settingsService.getHuts();
        setHuts(data || []);
      } catch (error) {
        // Fallback for demo if API fails
        setHuts([
          { id: "1", number: "01", status: "Available" },
          { id: "2", number: "02", status: "Available" },
          { id: "3", number: "03", status: "Occupied" },
          { id: "4", number: "04", status: "Available" },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadHuts();
  }, []);

  if (isLoading) return (
    <div className="h-14 flex items-center justify-center bg-accent/30 rounded-xl">
      <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Chòi / Vị trí</h3>
      <div className="grid grid-cols-4 gap-2">
        {huts.map((hut) => {
          const isAvailable = hut.status === "Available";
          const displayValue = hut.number || hut.name;
          
          return (
            <motion.button
              key={hut.id}
              whileTap={isAvailable ? { scale: 0.9 } : {}}
              onClick={() => isAvailable && onSelect(displayValue)}
              disabled={!isAvailable}
              className={cn(
                "h-14 rounded-xl font-black text-sm flex items-center justify-center border-2 transition-all",
                !isAvailable && "opacity-30 grayscale cursor-not-allowed border-transparent bg-muted",
                selectedId === displayValue
                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                  : "border-transparent bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {displayValue}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
