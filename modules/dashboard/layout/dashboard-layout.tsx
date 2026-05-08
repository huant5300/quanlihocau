"use client";

import React from "react";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function DashboardLayout({ children, header }: DashboardLayoutProps) {
  return (
    <div className="space-y-8 pb-10">
      {header && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {header}
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-8"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function DashboardHeader({ title, subtitle, actions }: { title: string, subtitle?: string, actions?: React.ReactNode }) {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight uppercase">{title}</h1>
        {subtitle && <p className="text-muted-foreground font-bold text-sm">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </>
  );
}
