"use client";

import React from "react";
import { WifiOff, AlertTriangle, RefreshCcw } from "lucide-react";
import { useOfflineStore } from "@/stores/offline-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing } = useOfflineStore();

  return (
    <AnimatePresence>
      {!isOnline || pendingCount > 0 ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] p-2 pointer-events-none"
        >
          <div className={cn(
            "max-w-md mx-auto pointer-events-auto flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl",
            !isOnline 
              ? "bg-orange-500/90 border-orange-400 text-white" 
              : "bg-blue-600/90 border-blue-400 text-white"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {!isOnline ? <WifiOff size={16} /> : <RefreshCcw size={16} className={isSyncing ? "animate-spin" : ""} />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {!isOnline ? "Chế độ Ngoại tuyến" : "Đang đồng bộ"}
                </p>
                <p className="text-xs font-bold mt-1">
                  {!isOnline 
                    ? `Đang lưu tạm ${pendingCount} thao tác.` 
                    : `Còn ${pendingCount} mục đang chờ tải lên...`}
                </p>
              </div>
            </div>
            
            {!isOnline && (
              <div className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                Offline
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
