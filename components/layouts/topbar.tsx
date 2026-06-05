"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  User, 
  Search,
  Moon,
  Sun,
  ChevronDown,
  Menu
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
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

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;
  const { 
    currentLakeId, 
    currentLakeName, 
    setCurrentLake, 
    setIsMobileNavOpen,
    notifications,
    clearNotifications
  } = useUIStore();
  const [lakes, setLakes] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchLakes = async () => {
      const result = await getMyLakes();
      if (result.success && result.data) {
        setLakes(result.data);
        if (result.data.length > 0) {
          // If the currently selected lake is not in the user's lakes (e.g., the hardcoded default "lake_01")
          const hasCurrent = result.data.find(l => l.id === currentLakeId);
          if (!hasCurrent) {
            setCurrentLake(result.data[0].id, result.data[0].name);
            switchLake(result.data[0].id); // Update server-side cookie/session
          }
        }
      }
    };
    fetchLakes();
  }, [currentLakeId, setCurrentLake]);

  const handleLakeSwitch = async (lakeId: string, lakeName: string) => {
    setCurrentLake(lakeId, lakeName);
    const result = await switchLake(lakeId);
    if (result.success) {
      toast.success(`Đã chuyển sang ${lakeName}`);
    } else {
      toast.error("Không thể chuyển hồ câu");
    }
  };

  const activeLake = lakes.find(l => l.id === currentLakeId);
  const currentLakePhone = activeLake?.phone || "";

  return (
    <header className="sticky top-0 z-30 w-full p-2 sm:p-4 lg:p-6 pointer-events-none">
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-6 flex items-center justify-between shadow-xl pointer-events-auto">
        
        {/* Left Side: Tenant Info & Lake Switcher */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/5"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col leading-tight">
              <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mb-1">Hồ đang quản lý</h2>
              
              {user?.role === "STAFF" || user?.role === "CASHIER" ? (
                <div className="flex flex-col items-start">
                  <p className="text-xs font-black tracking-tight">{currentLakeName || "Chưa chọn hồ"}</p>
                  {currentLakePhone && (
                    <p className="text-[10px] font-bold text-primary mt-0.5 tracking-wider">{currentLakePhone}</p>
                  )}
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex flex-col items-start cursor-pointer group">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black tracking-tight">{currentLakeName || "Chưa chọn hồ"}</p>
                        <ChevronDown size={12} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      {currentLakePhone && (
                        <p className="text-[10px] font-bold text-primary mt-0.5 tracking-wider">{currentLakePhone}</p>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl p-2">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-3">Chọn hồ câu</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    {lakes.map((lake) => (
                      <DropdownMenuItem 
                        key={lake.id}
                        onClick={() => handleLakeSwitch(lake.id, lake.name)}
                        className={cn(
                          "rounded-xl p-3 cursor-pointer font-bold text-xs transition-all flex flex-col items-start gap-0.5",
                          currentLakeId === lake.id ? "bg-primary text-white" : "hover:bg-accent"
                        )}
                      >
                        <span>{lake.name}</span>
                        {lake.phone && (
                          <span className={cn(
                            "text-[9px] font-bold tracking-wider",
                            currentLakeId === lake.id ? "text-white/80" : "text-primary"
                          )}>{lake.phone}</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    {lakes.length === 0 && (
                      <div className="p-3 text-[10px] italic text-muted-foreground">Không tìm thấy hồ nào</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Center: Search (POS Style) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-8 relative group pointer-events-auto">
          <Search className="absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors z-10" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh..."
            className="w-full h-12 pl-12 pr-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-bold text-xs shadow-sm"
          />
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Connection Status & Sync */}
          <SyncStatusIndicator />

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-accent transition-colors"
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-accent transition-colors relative"
              >
                <Bell size={20} className={cn(notifications.length > 0 && "text-red-500 animate-bounce")} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-6 h-5 flex items-center justify-center rounded-full border-2 border-background animate-sos shadow-lg shadow-red-500/50">
                    SOS {notifications.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl p-2 space-y-2">
              <div className="flex items-center justify-between p-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thông báo hệ thống</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => clearNotifications()}
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                  Không có thông báo mới nào
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {notifications.map((n) => (
                    <DropdownMenuItem 
                      key={n.id} 
                      className="rounded-xl p-3 flex items-start gap-3 cursor-pointer hover:bg-accent transition-all duration-200"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-xs",
                        n.type === "expired" ? "bg-red-500" : "bg-orange-500"
                      )}>
                        {n.type === "expired" ? "🚨" : "⚠️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight text-foreground">{n.message}</p>
                        <p className="text-[9px] font-bold text-muted-foreground mt-1">{n.timestamp}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-[1px] bg-border mx-1" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-accent transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 overflow-hidden">
                  {user?.image ? (
                    <img src={user.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-black leading-none">{user?.name || "Quản trị viên"}</span>
                    <ChevronDown size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{user?.role || "Chủ hồ"}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl p-2">
              <DropdownMenuLabel className="flex flex-col p-3">
                <span className="text-xs font-black uppercase tracking-tight">{user?.name || "Quản trị viên"}</span>
                <span className="text-[9px] font-bold text-muted-foreground truncate mt-0.5">{user?.email || "huant5300@gmail.com"}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={() => window.location.href = "/dashboard/settings"}
                className="rounded-xl p-3 cursor-pointer font-bold text-xs hover:bg-accent transition-all"
              >
                Cài đặt hồ
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.location.href = "/dashboard/settings"}
                className="rounded-xl p-3 cursor-pointer font-bold text-xs hover:bg-accent transition-all"
              >
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl p-3 cursor-pointer font-bold text-xs hover:bg-destructive/10 text-destructive transition-all"
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
