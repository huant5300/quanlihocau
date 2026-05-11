"use client";

import React from "react";
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
import { NavLink } from "@/components/shared/nav-link";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/utils/i18n";

const sidebarItems = [
  { icon: LayoutDashboard, label: t("sidebar.dashboard"), href: "/dashboard" },
  { icon: Waves, label: t("sidebar.sessions"), href: "/dashboard/sessions" },
  { icon: Users, label: t("sidebar.customers"), href: "/dashboard/crm" },
  { icon: Package, label: t("sidebar.products"), href: "/dashboard/products" },
  { icon: BarChart3, label: t("sidebar.reports"), href: "/dashboard/reports" },
  { icon: Settings, label: t("sidebar.settings"), href: "/dashboard/settings" },
];

export function Sidebar() {
  const { sidebarCollapsed: isCollapsed, toggleSidebar } = useUIStore();
  const { logout } = useAuth();

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
              <span className="font-black text-xl tracking-tight leading-none uppercase">Fish POS</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                {t("sidebar.management")}
              </span>
            </motion.div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-2 no-scrollbar overflow-y-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-4 px-4 py-4 rounded-[1.5rem] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all min-h-[48px]"
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="font-bold text-sm">{t("sidebar.logout")}</span>}
          </button>
          
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center p-4 rounded-[1.5rem] bg-accent/30 hover:bg-accent transition-all group min-h-[48px]"
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
