"use client";

import React from "react";
import { useUIStore } from "@/stores/ui-store";
import { useOfflineStore } from "@/stores/offline-store";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCcw, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

export function RealtimeStatusBar() {
  const { connectionStatus } = useUIStore();
  const { isOnline, pendingCount, isSyncing, lastSyncedAt } = useOfflineStore();

  const getSyncStatus = () => {
    if (!isOnline) return { icon: CloudOff, text: "Offline", color: "text-gray-500" };
    if (isSyncing) return { icon: RefreshCcw, text: "Đang đồng bộ...", color: "text-blue-500" };
    if (pendingCount > 0) return { icon: AlertTriangle, text: `${pendingCount} chờ đồng bộ`, color: "text-orange-500" };
    return { icon: CheckCircle, text: "Đã đồng bộ", color: "text-green-500" };
  };

  const syncStatus = getSyncStatus();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {/* Network Status */}
      <div className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all",
        isOnline ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
      )}>
        {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {isOnline ? "Internet Kết nối" : "Mất kết nối Internet"}
        </span>
      </div>

      {/* Realtime Status */}
      <div className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all",
        connectionStatus === "stable" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
      )}>
        {connectionStatus === "stable" ? <Cloud size={18} /> : <RefreshCcw size={18} className="animate-spin" />}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {connectionStatus === "stable" ? "Realtime Ổn định" : "Đang kết nối lại..."}
        </span>
      </div>

      {/* Sync Status */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all",
          syncStatus.color.includes("green") ? "bg-green-500/10 border-green-500/20" :
          syncStatus.color.includes("orange") ? "bg-orange-500/10 border-orange-500/20" :
          syncStatus.color.includes("blue") ? "bg-blue-500/10 border-blue-500/20" : "bg-gray-500/10 border-gray-500/20",
          syncStatus.color
        )}
      >
        <syncStatus.icon size={18} className={syncStatus.text.includes("Đang") ? "animate-spin" : ""} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {syncStatus.text}
        </span>
        {lastSyncedAt && !isSyncing && pendingCount === 0 && (
          <span className="text-[8px] opacity-60">
            {new Date(lastSyncedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </motion.div>
    </div>
  );
}
