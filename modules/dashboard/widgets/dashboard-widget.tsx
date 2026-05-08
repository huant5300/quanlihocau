"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { MoreVertical, GripVertical } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  onMoreClick?: () => void;
}

export function DashboardWidget({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  className,
  onMoreClick 
}: DashboardWidgetProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6 group hover:shadow-2xl transition-all border-white/5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={24} />
            </div>
          )}
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing">
            <GripVertical size={18} />
          </button>
          <button onClick={onMoreClick} className="p-2 hover:bg-accent rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </motion.div>
  );
}
