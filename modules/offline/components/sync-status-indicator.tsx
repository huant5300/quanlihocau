"use client";

import React from "react";
import { useOfflineStore } from "@/stores/offline-store";
import { CheckCircle2, Clock, CloudAlert, CloudUpload } from "lucide-react";
import { cn } from "@/utils/utils";

export function SyncStatusIndicator() {
  const { isOnline, pendingCount, isSyncing, lastSyncedAt } = useOfflineStore();

  if (!isOnline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-accent/30 rounded-xl border border-white/5">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
        pendingCount > 0 ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
      )}>
        {isSyncing ? (
          <CloudUpload size={16} className="animate-bounce" />
        ) : pendingCount > 0 ? (
          <Clock size={16} />
        ) : (
          <CheckCircle2 size={16} />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Đồng bộ</span>
        <span className="text-[10px] font-black uppercase tracking-tight">
          {pendingCount > 0 ? `${pendingCount} Chờ xử lý` : "Đã đồng bộ"}
        </span>
      </div>
    </div>
  );
}
