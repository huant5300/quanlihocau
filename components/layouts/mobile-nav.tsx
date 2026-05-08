"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Waves, 
  Package, 
  Users,
  Plus
} from "lucide-react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: Waves, label: "Sessions", href: "/dashboard/sessions" },
  { icon: null, label: "Add", href: "#", isFab: true },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: Users, label: "CRM", href: "/dashboard/crm" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
      <div className="glass rounded-[2.5rem] h-20 shadow-2xl flex items-center justify-around px-2 pointer-events-auto relative">
        {navItems.map((item, index) => {
          if (item.isFab) {
            return (
              <button
                key="fab"
                onClick={() => setOpenSessionModalOpen(true)}
                className="relative -top-10 w-16 h-16 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus size={32} />
              </button>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
