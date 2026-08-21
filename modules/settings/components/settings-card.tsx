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
      className={cn("bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-6", className)}
    >
      <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <Icon size={20} className="stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{description}</p>}
        </div>
      </div>
      
      <div>
        {children}
      </div>
    </motion.div>
  );
}

