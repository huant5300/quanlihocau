"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { SessionStatus } from "../types/session.types";
import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: SessionStatus | "WARNING" | "EXPIRED";
}

export function SessionStatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { label: string; className: string; dot: string }> = {
    ACTIVE: {
      label: "Đang câu",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      dot: "bg-green-500"
    },
    PAUSED: {
      label: "Tạm dừng",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      dot: "bg-yellow-500"
    },
    WARNING: {
      label: "Sắp hết giờ",
      className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      dot: "bg-orange-500"
    },
    EXPIRED: {
      label: "Hết giờ",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      dot: "bg-destructive"
    },
    COMPLETED: {
      label: "Đã xong",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      dot: "bg-blue-500"
    },
    CANCELLED: {
      label: "Đã hủy",
      className: "bg-muted text-muted-foreground border-transparent",
      dot: "bg-muted-foreground"
    },
    OVERDUE: {
      label: "Quá giờ",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      dot: "bg-red-500"
    }
  };

  const current = config[status] || config.ACTIVE;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
      current.className
    )}>
      {status === "WARNING" ? (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className={cn("w-1.5 h-1.5 rounded-full", current.dot)}
        />
      ) : (
        <div className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      )}
      <span>{current.label}</span>
    </div>
  );
}
