"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { MembershipLevel } from "../types/crm.types";
import { Award, ShieldCheck, Crown, Star } from "lucide-react";

interface MembershipBadgeProps {
  level: MembershipLevel;
  showIcon?: boolean;
}

export function MembershipBadge({ level, showIcon = true }: MembershipBadgeProps) {
  const config = {
    Regular: {
      label: "Thành viên",
      className: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      icon: Award
    },
    Silver: {
      label: "Hạng Bạc",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: ShieldCheck
    },
    Gold: {
      label: "Hạng Vàng",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: Star
    },
    VIP: {
      label: "Hạng VIP",
      className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: Crown
    },
  };

  const current = config[level];
  const Icon = current.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
      current.className
    )}>
      {showIcon && <Icon size={12} />}
      <span>{current.label}</span>
    </div>
  );
}
