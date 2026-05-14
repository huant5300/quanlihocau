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
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Ô số</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Đang câu</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
        {huts.map((hut) => {
          const isOccupied = hut.status === "OCCUPIED" || hut.status === "Occupied";
          const isSelected = selectedId === hut.id;
          const displayValue = (hut.name || hut.number || "---").replace("Ô số ", "");
          
          return (
            <motion.button
              key={hut.id}
              type="button"
              whileTap={!isOccupied ? { scale: 0.9 } : {}}
              onClick={() => !isOccupied && onSelect(hut.id)}
              disabled={isOccupied}
              title={isOccupied ? "Đang có khách" : `Chọn ô số ${displayValue}`}
              className={cn(
                "h-12 rounded-xl font-black text-xs flex items-center justify-center border-2 transition-all relative overflow-hidden",
                isOccupied 
                  ? "border-red-500/50 bg-red-500/10 text-red-500 cursor-not-allowed" 
                  : isSelected
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : "border-green-500/20 bg-green-500/5 text-green-500 hover:border-green-500/50"
              )}
            >
              {displayValue}
              {isOccupied && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="absolute bottom-0 left-0 h-0.5 bg-red-500"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
