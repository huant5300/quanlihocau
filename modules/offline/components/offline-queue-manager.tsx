"use client";

import React from "react";
import { useOfflineStore } from "@/stores/offline-store";
import { 
  X, 
  RefreshCcw, 
  Trash2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface OfflineQueueManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfflineQueueManager({ isOpen, onClose }: OfflineQueueManagerProps) {
  const { queue, removeFromQueue } = useOfflineStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-background rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Hàng đợi Ngoại tuyến</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  Quản lý {queue.length} thao tác đang chờ đồng bộ
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center hover:bg-muted transition-all">
              <X size={24} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
            {queue.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Clock size={32} />
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Không có thao tác chờ</p>
              </div>
            ) : (
              queue.map((action) => (
                <div key={action.id} className="p-5 bg-accent/30 rounded-2xl border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      action.status === "failed" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {action.status === "failed" ? <AlertCircle size={18} /> : <RefreshCcw size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{action.type.replace("_", " ")}</p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1">
                        {new Date(action.createdAt).toLocaleTimeString()} • Thử lại: {action.retryCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                      <RefreshCcw size={16} />
                    </button>
                    <button 
                      onClick={() => removeFromQueue(action.id)}
                      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-border/50 bg-card/50 flex items-center justify-between">
            <button className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Đồng bộ tất cả
            </button>
            <p className="text-[10px] font-bold text-muted-foreground text-right max-w-[150px]">
              Thao tác sẽ tự động đồng bộ khi có Internet.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
