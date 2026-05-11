"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Waves, 
  Package, 
  Users,
  Plus
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { NavLink } from "@/components/shared/nav-link";
import { t } from "@/utils/i18n";

const navItems = [
  { icon: LayoutDashboard, label: t("mobileNav.home"), href: "/dashboard" },
  { icon: Waves, label: t("mobileNav.sessions"), href: "/dashboard/sessions" },
  { icon: null, label: t("mobileNav.add"), href: "#", isFab: true },
  { icon: Package, label: t("mobileNav.products"), href: "/dashboard/products" },
  { icon: Users, label: t("mobileNav.customers"), href: "/dashboard/crm" },
];

export function MobileNav() {
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
      <div className="glass rounded-[2.5rem] h-20 shadow-2xl flex items-center justify-around px-2 pointer-events-auto relative">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key="fab"
                onClick={() => setOpenSessionModalOpen(true)}
                className="relative -top-10 w-16 h-16 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto min-h-[48px]"
              >
                <Plus size={32} />
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
