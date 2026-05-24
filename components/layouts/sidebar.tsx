"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Fish, 
  Users, 
  ShoppingBag, 
  Package, 
  History, 
  Settings, 
  LogOut,
  ChevronLeft,
  Bell,
  Home,
  PlusCircle
} from "lucide-react";
import { LakeSettingsModal } from "../shared/lake-settings-modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useUIStore } from "@/stores/ui-store";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.STAFF, UserRole.CASHIER] },
  { label: "Chủ Hồ", href: "/dashboard/owners", icon: Users, roles: [UserRole.SUPER_ADMIN] },
  { label: "Hồ Câu", href: "/dashboard/sessions", icon: Fish, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.STAFF] },
  { label: "Khách Hàng", href: "/dashboard/customers", icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.STAFF] },
  { label: "Tạo Vé Câu", href: "#", action: "create-ticket", icon: PlusCircle, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.STAFF, UserRole.CASHIER] },
  { label: "Kho Hàng", href: "/dashboard/inventory", icon: Package, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER] },
  { label: "Báo Cáo", href: "/dashboard/reports", icon: History, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER] },
  { label: "Nhân Viên", href: "/dashboard/staff", icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER] },
  { label: "Cài Đặt", href: "/dashboard/settings", icon: Settings, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setOpenSessionModalOpen } = useUIStore();

  if (status === "loading") {
    return (
      <div className="w-72 h-screen bg-slate-50 dark:bg-card/30 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 flex flex-col sticky top-0 animate-pulse">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-accent rounded-xl" />
          <div className="h-6 w-32 bg-slate-200 dark:bg-accent rounded-lg" />
        </div>
      </div>
    );
  }

  const userRole = session?.user?.role || UserRole.STAFF;
  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-72 h-screen bg-white/95 dark:bg-card/30 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 flex flex-col sticky top-0 shadow-sm">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Fish size={24} />
        </div>
        <span className="font-black text-xl tracking-tighter uppercase text-slate-900 dark:text-white">Quản lý hồ câu</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          if (item.action === "create-ticket") {
            return (
              <button
                key="create-ticket"
                onClick={() => setOpenSessionModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              >
                <item.icon size={20} className="text-slate-500 dark:text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-black">{item.label}</span>
              </button>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/25 font-bold" 
                    : "text-slate-650 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-500 dark:text-muted-foreground group-hover:text-primary transition-colors")} />
                <span className="text-sm font-black">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        {(userRole === UserRole.OWNER || userRole === UserRole.SUPER_ADMIN) && (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full h-12 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all border border-slate-200 dark:border-white/5 text-slate-800 dark:text-white"
          >
            <Settings size={16} />
            Cài đặt hồ câu
          </button>
        )}

        <div className="bg-slate-100 dark:bg-white/5 rounded-3xl p-4 flex items-center gap-3 border border-slate-200 dark:border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-md">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate uppercase tracking-widest text-slate-900 dark:text-white">{session?.user?.name || "Người dùng"}</p>
            <p className="text-[10px] text-slate-600 dark:text-muted-foreground font-black tracking-tight">{userRole}</p>
          </div>
          <button 
            onClick={() => signOut()}
            type="button"
            className="p-2 hover:bg-destructive/10 text-slate-600 dark:text-muted-foreground hover:text-destructive rounded-xl transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <LakeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
