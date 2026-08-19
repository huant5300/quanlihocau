import React from "react";
import { Award, Crown, Star, Shield } from "lucide-react";
import { cn } from "@/utils/utils";

interface LoyaltyBadgeProps {
  tier: string;
  points?: number;
  className?: string;
  showPoints?: boolean;
}

export function LoyaltyBadge({ tier, points, className, showPoints = false }: LoyaltyBadgeProps) {
  let config = {
    icon: Star,
    color: "text-amber-700 bg-amber-700/10 border-amber-700/20",
    label: "Đồng"
  };

  switch (tier?.toUpperCase()) {
    case "SILVER":
      config = {
        icon: Shield,
        color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
        label: "Bạc"
      };
      break;
    case "GOLD":
      config = {
        icon: Award,
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        label: "Vàng"
      };
      break;
    case "DIAMOND":
      config = {
        icon: Crown,
        color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
        label: "Kim Cương"
      };
      break;
    default:
      config = {
        icon: Star,
        color: "text-amber-700 bg-amber-700/10 border-amber-700/20",
        label: "Đồng"
      };
  }

  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
      config.color,
      className
    )}>
      <Icon size={12} className="stroke-[2.5]" />
      <span>{config.label}</span>
      {showPoints && points !== undefined && (
        <span className="ml-1 pl-2 border-l border-current/20">
          {points} Đ
        </span>
      )}
    </div>
  );
}
