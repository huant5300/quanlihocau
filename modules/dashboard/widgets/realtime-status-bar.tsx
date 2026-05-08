"use client";

import React from "react";
import { useUIStore } from "@/stores/ui-store";
import { useOfflineStore } from "@/stores/offline-store";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCcw } from "lucide-react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

export function RealtimeStatusBar() {
  const { connectionStatus } = useUIStore();
  const { isOnline, pendingCount } = useOfflineStore();

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
      {pendingCount > 0 && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl border bg-purple-500/10 border-purple-500/20 text-purple-500 shadow-xl shadow-purple-500/5"
        >
          <CloudOff size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {pendingCount} mục chờ đồng bộ
          </span>
        </motion.div>
      )}
    </div>
  );
}
