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
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-foreground font-bold">
          <Clock size={20} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Chọn Gói Câu</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => onSelect(pkg.id)}
            type="button"
            className={cn(
              "p-5 rounded-2xl flex items-center justify-between border-2 transition-all relative overflow-hidden group min-h-[80px]",
              selectedId === pkg.id 
                ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20" 
                : "border-slate-300 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                selectedId === pkg.id 
                  ? "bg-primary text-white scale-105 shadow-md" 
                  : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300"
              )}>
                <Clock size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">{pkg.name}</p>
                <p className={cn(
                  "text-xs font-black uppercase tracking-wider mt-0.5",
                  selectedId === pkg.id ? "text-primary dark:text-primary-foreground" : "text-slate-600 dark:text-slate-400"
                )}>{pkg.durationHours} Giờ thi đấu</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "font-black text-xl tracking-tighter",
                selectedId === pkg.id ? "text-primary dark:text-primary-foreground text-2xl" : "text-slate-900 dark:text-white"
              )}>
                {pkg.price.toLocaleString()}đ
              </p>
            </div>

            {pkg.isPopular && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[9px] font-black text-white rounded-bl-xl uppercase tracking-widest shadow-sm">
                Phổ biến
              </div>
            )}
          </button>
        ))}
        
        <button
          key="custom"
          onClick={() => onSelect("custom")}
          type="button"
          className={cn(
            "p-5 rounded-2xl flex items-center justify-between border-2 transition-all relative overflow-hidden group min-h-[80px]",
            selectedId === "custom" 
              ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20" 
              : "border-slate-300 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              selectedId === "custom" 
                ? "bg-primary text-white scale-105 shadow-md" 
                : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300"
            )}>
              <Clock size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">Tự nhập / Giờ lẻ (custom)</p>
              <p className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5 uppercase">Tùy chỉnh số giờ và đơn giá câu</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-black text-sm text-primary dark:text-primary-foreground tracking-widest uppercase bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20">
              Tùy chỉnh
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
