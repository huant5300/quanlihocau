"use client";

import React, { useState, useEffect } from "react";
import { Printer, Bluetooth, BluetoothOff, CheckCircle2, AlertCircle } from "lucide-react";
import { printerService } from "@/services/printer/printer-service";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";

export function PrinterManager() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(printerService.isConnected());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    const success = await printerService.connect();
    setIsConnected(success);
    setIsConnecting(false);
  };

  return (
    <div className="fixed bottom-24 right-6 sm:right-8 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "flex items-center gap-3 p-3 pl-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all",
            isConnected 
              ? "bg-green-500/10 border-green-500/20 text-green-500" 
              : "bg-background/80 border-border shadow-black/5"
          )}
        >
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Máy in 58mm</span>
            <span className="text-[10px] font-black uppercase tracking-tight">
              {isConnected ? "Sẵn sàng" : "Chưa kết nối"}
            </span>
          </div>

          <button
            onClick={isConnected ? () => printerService.disconnect() : handleConnect}
            disabled={isConnecting}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90",
              isConnected 
                ? "bg-green-500 text-white" 
                : "bg-accent hover:bg-muted text-muted-foreground"
            )}
          >
            {isConnecting ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : isConnected ? (
              <Bluetooth size={18} />
            ) : (
              <BluetoothOff size={18} />
            )}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
