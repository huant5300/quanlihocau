"use client";

import React from "react";
import { cn } from "@/utils/utils";

interface InventoryStatusBadgeProps {
  stock: number;
}

export function InventoryStatusBadge({ stock }: InventoryStatusBadgeProps) {
  let status = "IN_STOCK";
  if (stock === 0) status = "OUT_OF_STOCK";
  else if (stock <= 5) status = "LOW_STOCK";

  const config = {
    IN_STOCK: {
      label: "Còn hàng",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    LOW_STOCK: {
      label: "Sắp hết",
      className: "bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse",
    },
    OUT_OF_STOCK: {
      label: "Hết hàng",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const current = config[status as keyof typeof config];

  return (
    <div className={cn(
      "px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
      current.className
    )}>
      {current.label} ({stock})
    </div>
  );
}
