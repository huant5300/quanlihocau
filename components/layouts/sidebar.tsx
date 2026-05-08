"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import { 
  LayoutDashboard, 
  Waves, 
  Users, 
  Package, 
  BarChart3, 
  Megaphone, 
  Settings,
  ChevronLeft,
  Menu,
  X,
  Fish
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Waves, label: "Sessions", href: "/dashboard/sessions" },
  { icon: Users, label: "CRM", href: "/dashboard/crm" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  { icon: Megaphone, label: "Marketing", href: "/dashboard/marketing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed: isCollapsed, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-4 bg-primary text-white rounded-full shadow-2xl active:scale-95 transition-transform"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card border-r transition-all duration-500 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full py-6">
          {/* Brand Logo */}
          <div className="px-6 mb-10 flex items-center gap-4">
            <div className="min-w-[40px] h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Fish size={24} />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-xl tracking-tight whitespace-nowrap"
              >
                Fishing POS
              </motion.span>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative min-h-[52px]",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                  )}
                >
                  <item.icon size={22} className={cn("shrink-0", isActive ? "animate-pulse" : "")} />
                  {!isCollapsed && (
                    <span className="font-medium text-[15px]">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover text-popover-foreground text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle (Desktop Only) */}
          <div className="px-3 mt-auto">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-full items-center justify-center p-3 rounded-2xl border border-dashed border-border hover:bg-accent transition-all group"
            >
              <ChevronLeft 
                size={20} 
                className={cn("transition-transform duration-500 text-muted-foreground group-hover:text-foreground", isCollapsed && "rotate-180")} 
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
