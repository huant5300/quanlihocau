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
