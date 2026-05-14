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
  ChevronDown
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

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;
  const { currentLakeId, currentLakeName, setCurrentLake } = useUIStore();
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
    <header className="sticky top-0 z-30 w-full p-2 sm:p-4 lg:p-6 pointer-events-none">
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-6 flex items-center justify-between shadow-xl pointer-events-auto">
        
        {/* Left Side: Tenant Info & Lake Switcher */}
        <div className="flex items-center gap-6">
          <div className="lg:hidden w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs">
            POS
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Hồ đang quản lý</h2>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 mt-1 cursor-pointer group">
                    <p className="text-sm font-black tracking-tight">{currentLakeName || "Chưa chọn hồ"}</p>
                    <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl p-2">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-3">Chọn hồ câu</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {lakes.map((lake) => (
                    <DropdownMenuItem 
                      key={lake.id}
                      onClick={() => handleLakeSwitch(lake.id, lake.name)}
                      className={cn(
                        "rounded-xl p-3 cursor-pointer font-bold text-xs transition-all",
                        currentLakeId === lake.id ? "bg-primary text-white" : "hover:bg-accent"
                      )}
                    >
                      {lake.name}
                    </DropdownMenuItem>
                  ))}
                  {lakes.length === 0 && (
                    <div className="p-3 text-[10px] italic text-muted-foreground">Không tìm thấy hồ nào</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Center: Search (POS Style) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-8 relative group">
          <Search className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh..."
            className="w-full h-11 pl-11 pr-4 bg-background/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold text-xs"
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
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-accent transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>

          <div className="h-8 w-[1px] bg-border mx-1" />

          {/* User Profile */}
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
        </div>
      </div>
    </header>
  );
}
