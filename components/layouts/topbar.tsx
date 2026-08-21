"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Search,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  PlusCircle,
  HelpCircle,
  Settings,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import { SyncStatusIndicator } from "@/modules/offline/components/sync-status-indicator";
import { getMyLakes, switchLake } from "@/actions/lake-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;
  const { 
    currentLakeId, 
    currentLakeName, 
    setCurrentLake, 
    setIsMobileNavOpen,
    setOpenSessionModalOpen 
  } = useUIStore();
  const [lakes, setLakes] = useState<any[]>([]);

  useEffect(() => {
    const fetchLakes = async () => {
      const result = await getMyLakes();
      if (result.success) {
        setLakes(result.data || []);
      }
    };
    fetchLakes();
  }, []);

  const handleLakeSwitch = async (lakeId: string, lakeName: string) => {
    setCurrentLake(lakeId, lakeName);
    const result = await switchLake(lakeId);
    if (result.success) {
      toast.success(`Đã chuyển sang ${lakeName}`);
    } else {
      toast.error("Không thể chuyển hồ câu");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      
      {/* Left: Mobile Toggle & Lake Switcher */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 transition-all"
        >
          <Menu size={18} />
        </button>
        
        {/* Lake Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/80 hover:bg-slate-100 transition-colors text-left">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[140px] sm:max-w-[200px]">
                  {currentLakeName || "Hồ câu dịch vụ"}
                </span>
              </div>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 text-xs">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 p-2">
              Danh sách hồ của bạn
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {lakes.map((lake) => (
              <DropdownMenuItem 
                key={lake.id}
                onClick={() => handleLakeSwitch(lake.id, lake.name)}
                className={cn(
                  "rounded-lg p-2.5 cursor-pointer font-semibold transition-all",
                  currentLakeId === lake.id ? "bg-emerald-600 text-white" : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                )}
              >
                {lake.name}
              </DropdownMenuItem>
            ))}
            {lakes.length === 0 && (
              <div className="p-2 text-[11px] italic text-slate-400">Không tìm thấy hồ nào</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center: Search (POS Style) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6 relative">
        <Search className="absolute left-3.5 text-slate-400" size={15} />
        <input 
          type="text" 
          placeholder="Tìm cần thủ, số điện thoại, đơn hàng..."
          className="w-full h-9 pl-9 pr-3 bg-slate-100/80 dark:bg-zinc-800/80 rounded-lg border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs transition-all text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
        />
      </div>

      {/* Right: Quick Action POS Button + Settings & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Quick Open Session / POS Button (like "Bán hàng" in KiotViet) */}
        <button
          onClick={() => setOpenSessionModalOpen(true)}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 transition-all"
        >
          <PlusCircle size={15} />
          <span className="hidden sm:inline">Vào ca / Bán vé</span>
          <span className="sm:hidden">Bán vé</span>
        </button>

        {/* Connection Status Indicator */}
        <SyncStatusIndicator />

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Chế độ sáng / tối"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors relative"
          title="Thông báo"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
            {user?.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.name?.[0] || "U").toUpperCase()
            )}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight truncate max-w-[120px]">
              {user?.name || "Chủ hồ"}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-none mt-0.5">
              {user?.role === UserRole.SUPER_ADMIN ? "Super Admin" : "Chủ sở hữu hồ"}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}

