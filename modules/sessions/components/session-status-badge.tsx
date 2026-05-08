"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { SessionStatus } from "../types/session.types";
import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: SessionStatus;
}

export function SessionStatusBadge({ status }: StatusBadgeProps) {
  const config = {
    ACTIVE: {
      label: "Đang câu",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      dot: "bg-green-500"
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
    }
  };

  const current = config[status];

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
