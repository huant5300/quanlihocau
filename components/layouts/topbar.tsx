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
    <header className="sticky top-0 z-30 w-full p-4 lg:p-6 pointer-events-none">
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 h-20 rounded-[2rem] px-6 flex items-center justify-between shadow-xl pointer-events-auto">
        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative group">
          <Search className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh... (Ctrl + K)"
            className="w-full h-12 pl-12 pr-4 bg-background/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-medium text-sm"
          />
        </div>

        {/* Mobile Brand Placeholder */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <span className="font-black text-xs uppercase">POS</span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Status Badge */}
          <div className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-colors",
            isOnline ? "border-green-500/20 bg-green-500/10 text-green-500" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
          )}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>

          <button className="p-3 rounded-xl hover:bg-accent transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>

          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 rounded-xl hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="h-8 w-[1px] bg-border mx-1" />

          {/* User Profile */}
          <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-accent transition-all group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              <User size={20} />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-black leading-none">{user?.full_name || "Admin"}</span>
                <ChevronDown size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{user?.role || "Owner"}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
