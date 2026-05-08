"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  isMobile?: boolean;
}

export function NavLink({ href, icon: Icon, label, collapsed, isMobile }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isMobile) {
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all relative",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavMobile"
            className="absolute inset-0 bg-primary/10 rounded-2xl"
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden min-h-[48px]",
        isActive 
          ? "bg-primary text-white shadow-xl shadow-primary/20" 
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
      {!collapsed && (
        <span className="font-bold text-sm tracking-wide">{label}</span>
      )}
      
      {collapsed && (
        <div className="absolute left-full ml-6 px-4 py-2 bg-popover text-popover-foreground text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 pointer-events-none shadow-2xl border border-white/10">
          {label}
        </div>
      )}
      
      {isActive && (
        <motion.div
          layoutId="activeSidebar"
          className="absolute inset-0 bg-white/10"
          transition={{ type: "spring", duration: 0.6 }}
        />
      )}
    </Link>
  );
}
