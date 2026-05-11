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
import { useAuthContext } from "@/providers/auth/auth-provider";
import { useUIStore } from "@/stores/ui-store";
import { SyncStatusIndicator } from "@/modules/offline/components/sync-status-indicator";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthContext();
  const { tenantName } = useUIStore();

  return (
    <header className="sticky top-0 z-30 w-full p-4 lg:p-6 pointer-events-none">
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 h-20 rounded-[2rem] px-6 flex items-center justify-between shadow-xl pointer-events-auto">
        
        {/* Left Side: Tenant Info */}
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs">
            POS
          </div>
          <div className="hidden sm:flex flex-col">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Cửa hàng</h2>
            <p className="text-sm font-black mt-1 tracking-tight">{tenantName}</p>
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
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-black leading-none">{user?.full_name || "Quản trị viên"}</span>
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
