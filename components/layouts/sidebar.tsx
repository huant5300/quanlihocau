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
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "STAFF", "CASHIER"] },
  { label: "Hồ Câu", href: "/dashboard/sessions", icon: Fish, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { label: "Khách Hàng", href: "/dashboard/customers", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { label: "Bán Hàng (POS)", href: "/dashboard/pos", icon: ShoppingBag, roles: ["SUPER_ADMIN", "ADMIN", "CASHIER"] },
  { label: "Kho Hàng", href: "/dashboard/inventory", icon: Package, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Báo Cáo", href: "/dashboard/reports", icon: History, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Cài Đặt", href: "/dashboard/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "STAFF";

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-72 h-screen bg-card/30 backdrop-blur-3xl border-r border-white/5 flex flex-col sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Fish size={24} />
        </div>
        <span className="font-black text-xl tracking-tighter uppercase">Fishing SaaS</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 font-bold" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                <span className="text-sm">{item.label}</span>
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
        <div className="bg-white/5 rounded-3xl p-4 flex items-center gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-black text-xs">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate uppercase tracking-widest">{session?.user?.name || "Người dùng"}</p>
            <p className="text-[10px] text-muted-foreground font-bold tracking-tight">{userRole}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
