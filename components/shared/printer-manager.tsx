"use client";

import React, { useState } from "react";
import { Printer, Bluetooth, BluetoothConnected, BluetoothOff, Settings } from "lucide-react";
import { PrinterService } from "@/lib/printer/printer-service";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";

export function PrinterManager() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    const success = await PrinterService.connect();
    setIsConnected(success);
    setIsConnecting(false);
  };

  return (
    <div className="fixed bottom-24 right-8 z-40">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={cn(
            "flex items-center gap-3 p-3 bg-card border-2 rounded-2xl shadow-xl transition-all",
            isConnected ? "border-green-500/20" : "border-border/50"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isConnected ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
          )}>
            {isConnected ? <BluetoothConnected size={20} /> : <Bluetooth size={20} />}
          </div>
          
          <div className="pr-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Máy in Bill</p>
            <p className="text-xs font-bold">{isConnected ? "Đã kết nối" : "Chưa kết nối"}</p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all",
              isConnected 
                ? "bg-accent hover:bg-accent/80 text-foreground" 
                : "bg-primary text-white shadow-lg shadow-primary/20"
            )}
          >
            {isConnecting ? "Đang kết nối..." : isConnected ? "Cài đặt" : "Kết nối"}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
