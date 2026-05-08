"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({ title, description, icon: Icon, children, className }: SettingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card p-8 rounded-[2.5rem] space-y-8", className)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
          {description && <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">{description}</p>}
        </div>
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
}
