"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/api/settings-service";
import { MapPin, Waves, Loader2 } from "lucide-react";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, subtitle, actions }: DashboardHeaderProps) {
  const hasHydrated = useHasHydrated();
  const { data: lakeInfo, isLoading } = useQuery({
    queryKey: ["lake-info"],
    queryFn: () => settingsService.getLakeInfo(),
    enabled: hasHydrated
  });

  return (
    <div className="space-y-6 mb-10">
      {/* Lake Info Banner (Always at top) */}
      <div className="bg-gradient-to-r from-primary/20 to-blue-500/10 border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl min-h-[120px]">
        {!hasHydrated || isLoading ? (
          <div className="flex items-center justify-center w-full">
            <Loader2 className="animate-spin text-primary/50" size={24} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 shrink-0">
                <Waves size={32} />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-2 truncate">
                  {typeof lakeInfo?.name === 'string' ? lakeInfo.name : "HỒ CÂU SAAS"}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} className="shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest truncate">
                    {typeof lakeInfo?.address === 'string' ? lakeInfo.address : "Đang cập nhật địa chỉ..."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 px-8 py-3 bg-black/20 rounded-2xl border border-white/5 shrink-0">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Số ô câu</p>
                <p className="text-xl font-black text-primary">{String(lakeInfo?.totalSpots || 0)}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Trạng thái</p>
                <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Đang hoạt động</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-4xl font-black tracking-tight uppercase text-white/90 truncate">{title}</h1>
          {subtitle && <p className="text-muted-foreground font-medium mt-1 text-sm">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
