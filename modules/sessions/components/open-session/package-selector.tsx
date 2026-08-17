"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { Clock } from "lucide-react";
import { sessionService } from "@/services/api/session-service";

interface Package {
  id: string;
  name: string;
  durationHours: number;
  price: number;
  isPopular?: boolean;
}

interface PackageSelectorProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function PackageSelector({ selectedId, onSelect }: PackageSelectorProps) {
  const [packages, setPackages] = React.useState<Package[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadPackages() {
      try {
        const data = await sessionService.getPackages();
        // Support both duration_hours and durationHours for backward compatibility if needed, but prefer durationHours
        const normalized = (data || []).map((p: any) => ({
          ...p,
          durationHours: p.durationHours || p.duration_hours || 0,
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
        }));
        setPackages(normalized);
      } catch (error) {
        console.error("Failed to load packages", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPackages();
  }, []);

  if (isLoading) return (
    <div className="h-14 flex items-center justify-center bg-accent/30 rounded-xl">
      <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chọn Gói Câu</h3>
      <div className="grid grid-cols-1 gap-3">
        {packages.map((pkg) => (
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{pkg.durationHours} Giờ thi đấu</p>
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
