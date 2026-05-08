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
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/utils/utils";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="h-20 border-b bg-card/50 backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      {/* Left: Tenant Info */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hồ Câu</h2>
          <p className="text-lg font-bold truncate max-w-[150px] md:max-w-[250px]">
            {user?.tenant_id || "Fishing Paradise"}
          </p>
        </div>
      </div>

      {/* Center: Search (POS Style) */}
      <div className="flex-1 max-w-xl mx-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh (Ctrl + K)..."
            className="w-full h-12 pl-12 pr-4 bg-accent/30 hover:bg-accent/50 focus:bg-background border-2 border-transparent focus:border-primary/20 rounded-2xl text-[15px] outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-5">
        {/* Network Status */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors hidden sm:flex",
          isOnline 
            ? "bg-green-500/10 text-green-500 border-green-500/20" 
            : "bg-destructive/10 text-destructive border-destructive/20"
        )}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isOnline ? "Trực tuyến" : "Ngoại tuyến"}</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-xl hover:bg-accent transition-all active:scale-90"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl hover:bg-accent transition-all active:scale-90 relative group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card animate-bounce" />
        </button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 py-1 cursor-pointer group active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <User size={22} />
            )}
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              <p className="text-[15px] font-bold leading-none">{user?.full_name || "Admin"}</p>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[11px] font-bold text-primary uppercase mt-1.5 tracking-widest">{user?.role || "Owner"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
