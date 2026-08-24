"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Fish, 
  Users, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Clock,
  CircleDollarSign,
  Layers,
  Sparkles,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { LakeSettingsModal } from "../shared/lake-settings-modal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useUIStore } from "@/stores/ui-store";

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: any;
  roles: UserRole[];
  action?: string;
  badge?: string;
  children?: { label: string; href: string; action?: string }[];
}

const menuSections: MenuItem[] = [
  { 
    id: "home", 
    label: "Trang chủ", 
    href: "/dashboard", 
    icon: Home, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF, UserRole.CASHIER] 
  },
  { 
    id: "sessions", 
    label: "Ca câu & Bán vé", 
    icon: Fish, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF, UserRole.CASHIER],
    children: [
      { label: "Tổng quan ca câu", href: "/dashboard/sessions" },
      { label: "Vào ca câu mới", href: "#", action: "create-ticket" },
    ]
  },
  { 
    id: "orders", 
    label: "Đơn hàng & POS", 
    href: "/dashboard/invoices", 
    icon: ShoppingBag, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF, UserRole.CASHIER],
    children: [
      { label: "Hóa đơn & Thanh toán", href: "/dashboard/invoices" },
      { label: "Bán hàng POS", href: "/dashboard/pos" },
    ]
  },
  { 
    id: "customers", 
    label: "Khách hàng", 
    href: "/dashboard/customers", 
    icon: Users, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF],
    children: [
      { label: "Danh sách cần thủ", href: "/dashboard/customers" },
      { label: "Khách nợ / Thẻ cào", href: "/dashboard/crm" },
    ]
  },
  { 
    id: "finance", 
    label: "Tài chính & Thu chi", 
    href: "/dashboard/billing", 
    icon: CircleDollarSign, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER],
    children: [
      { label: "Gói cước & Đăng ký", href: "/dashboard/billing" },
    ]
  },
  { 
    id: "products", 
    label: "Sản phẩm & Menu", 
    href: "/dashboard/products", 
    icon: Layers, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER],
    children: [
      { label: "Mồi câu & Đồ uống", href: "/dashboard/products" },
      { label: "Kho hàng & Tồn kho", href: "/dashboard/inventory" },
      { label: "Nhật ký thả cá", href: "/dashboard/fish-stock" },
    ]
  },
  { 
    id: "staff", 
    label: "Nhân viên & Ca trực", 
    href: "/dashboard/staff", 
    icon: Clock, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER],
    children: [
      { label: "Danh sách nhân viên", href: "/dashboard/staff" },
      { label: "Bàn giao ca & Dòng tiền", href: "/dashboard/shifts" },
    ]
  },
  { 
    id: "reports", 
    label: "Báo cáo", 
    href: "/dashboard/reports", 
    icon: BarChart3, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER],
    children: [
      { label: "Tổng quan báo cáo", href: "/dashboard/reports" },
      { label: "Lịch sử hoạt động", href: "/dashboard/activity-log" },
    ]
  },
  { 
    id: "owners", 
    label: "Quản lý chủ hồ", 
    href: "/dashboard/owners", 
    icon: ShieldCheck, 
    roles: [UserRole.SUPER_ADMIN] 
  },
  { 
    id: "settings", 
    label: "Cấu hình", 
    href: "/dashboard/settings", 
    icon: Settings, 
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER] 
  },
  { 
    id: "guide", 
    label: "Hướng dẫn sử dụng", 
    href: "/dashboard/guide", 
    icon: BookOpen, 
    badge: "Mới",
    roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF, UserRole.CASHIER] 
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    sessions: true,
    reports: true,
  });
  const { setOpenSessionModalOpen } = useUIStore();

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (status === "loading") {
    return (
      <div className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col sticky top-0 animate-pulse">
        <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-9 h-9 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-5 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  const isSuperAdminUser = session?.user?.role === UserRole.SUPER_ADMIN || session?.user?.email === "huant5300@gmail.com";
  const userRole = isSuperAdminUser ? UserRole.SUPER_ADMIN : (session?.user?.role || UserRole.STAFF);
  const filteredItems = menuSections.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800 flex flex-col sticky top-0 shadow-sm select-none">
      
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
          <Fish size={20} className="stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-sm tracking-tight uppercase text-slate-900 dark:text-white truncate">
            Quản Lý Hồ Câu
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống Cloud POS
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar text-xs font-semibold">
        {filteredItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isGroupOpen = openGroups[item.id] ?? false;
          const isParentActive = item.href ? pathname === item.href : item.children?.some(c => pathname === c.href);

          if (!hasChildren) {
            return (
              <Link key={item.id} href={item.href || "#"}>
                <div
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group",
                    isParentActive
                      ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/20"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={17} className={cn(isParentActive ? "text-white" : "text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 transition-colors")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          }

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left group",
                  isParentActive && !isGroupOpen
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} className={cn(isParentActive ? "text-emerald-600" : "text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 transition-colors")} />
                  <span>{item.label}</span>
                </div>
                {isGroupOpen ? (
                  <ChevronDown size={14} className="text-slate-400 transition-transform" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400 transition-transform" />
                )}
              </button>

              <AnimatePresence>
                {isGroupOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pl-7 pr-1 space-y-0.5"
                  >
                    {item.children?.map((child, idx) => {
                      if (child.action === "create-ticket") {
                        return (
                          <button
                            key={idx}
                            onClick={() => setOpenSessionModalOpen(true)}
                            className="w-full text-left py-2 px-3 rounded-lg text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 transition-colors"
                          >
                            <PlusCircle size={13} />
                            <span>{child.label}</span>
                          </button>
                        );
                      }

                      const isChildActive = pathname === child.href;
                      return (
                        <Link key={idx} href={child.href}>
                          <div
                            className={cn(
                              "py-2 px-3 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between",
                              isChildActive
                                ? "bg-emerald-600 text-white font-bold shadow-xs"
                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-zinc-800/40"
                            )}
                          >
                            <span>{child.label}</span>
                            {isChildActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Promo Upgrade Box */}
      <div className="p-3">
        <Link href="/dashboard/billing">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Ưu đãi Hot
              </span>
              <span className="text-[11px] font-black text-amber-300">99k/tháng</span>
            </div>
            <p className="text-xs font-bold mt-1.5 leading-snug">
              Gói Bạc - Full 100% chức năng
            </p>
            <p className="text-[10px] text-emerald-100 mt-0.5">
              Dùng thử 5 ngày Miễn Phí
            </p>
            <div className="mt-2 text-[10px] font-extrabold flex items-center gap-1 text-white group-hover:translate-x-0.5 transition-transform">
              <span>Nâng cấp ngay</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </Link>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold truncate text-slate-800 dark:text-zinc-200 leading-tight">
              {session?.user?.name || "Chủ hồ câu"}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-zinc-400 font-medium truncate">
              {userRole === UserRole.OWNER ? "Chủ sở hữu hồ câu" : userRole === UserRole.SUPER_ADMIN ? "Quản trị viên cấp cao" : "Nhân viên vận hành"}
            </p>
          </div>
          <button 
            onClick={() => signOut()}
            type="button"
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <LakeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
}

