"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Fish, 
  PlusCircle, 
  Users,
  Menu
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { NavLink } from "@/components/shared/nav-link";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Fish, label: "Hồ Câu", href: "/dashboard/sessions" },
  { icon: PlusCircle, label: "Tạo Vé", href: "#", isCreateTicket: true },
  { icon: Users, label: "Khách Hàng", href: "/dashboard/customers" },
  { icon: Menu, label: "Menu", href: "#", isMenuTrigger: true },
];

export function MobileNav() {
  const { setIsMobileNavOpen, setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <div className="glass rounded-[2rem] h-20 shadow-2xl flex items-center justify-around px-2 pointer-events-auto relative border border-white/5">
        {navItems.map((item) => {
          if (item.isMenuTrigger) {
            return (
              <button
                key="menu-trigger"
                onClick={() => setIsMobileNavOpen(true)}
                className="flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl text-muted-foreground hover:text-primary transition-colors pointer-events-auto active:scale-95"
              >
                <Menu size={22} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Menu</span>
              </button>
            );
          }

          if (item.isCreateTicket) {
            return (
              <button
                key="create-ticket"
                onClick={() => setOpenSessionModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl text-muted-foreground hover:text-primary transition-colors pointer-events-auto active:scale-95"
              >
                <PlusCircle size={22} className="text-primary animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Tạo Vé</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon!}
              label={item.label}
              isMobile
            />
          );
        })}
      </div>
    </div>
  );
}
