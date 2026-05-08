"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import { 
  LayoutDashboard, 
  Waves, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  ChevronLeft,
  Fish,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Waves, label: "Sessions", href: "/dashboard/sessions" },
  { icon: Users, label: "CRM", href: "/dashboard/crm" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed: isCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen hidden lg:block transition-all duration-500 ease-in-out p-4",
        isCollapsed ? "w-24" : "w-72"
      )}
    >
      <div className="h-full glass rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        {/* Brand Logo */}
        <div className="p-8 mb-4 flex items-center gap-4">
          <div className="min-w-[48px] h-12 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
            <Fish size={28} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-black text-xl tracking-tight leading-none">FISH POS</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Management</span>
            </motion.div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {!isCollapsed && (
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                )}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-6 px-4 py-2 bg-popover text-popover-foreground text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 pointer-events-none shadow-2xl border border-white/10">
                    {item.label}
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
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2">
          <button className="flex w-full items-center gap-4 px-4 py-4 rounded-[1.5rem] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut size={22} />
            {!isCollapsed && <span className="font-bold text-sm">Đăng xuất</span>}
          </button>
          
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center p-4 rounded-[1.5rem] bg-accent/30 hover:bg-accent transition-all group"
          >
            <ChevronLeft 
              size={20} 
              className={cn("transition-transform duration-500 text-muted-foreground group-hover:text-foreground", isCollapsed && "rotate-180")} 
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
