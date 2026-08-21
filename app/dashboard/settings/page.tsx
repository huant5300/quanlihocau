"use client";

import React, { useState } from "react";
import { LakeInfoForm } from "@/modules/settings/components/lake-info-form";
import { PackageSettings } from "@/modules/settings/components/package-settings";
import { HutSettings } from "@/modules/settings/components/hut-settings";
import { EmployeeSettings } from "@/modules/settings/components/employee-settings";
import { SaasBillingSettings } from "@/modules/settings/components/saas-billing-settings";
import { 
  Building2, 
  Package, 
  MapPin, 
  Users, 
  Palette, 
  Monitor,
  Moon,
  Sun,
  CreditCard
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useTheme } from "next-themes";

const SETTINGS_SECTIONS = [
  { id: "lake", label: "Cấu hình Hồ", icon: Building2 },
  { id: "packages", label: "Gói ca câu", icon: Package },
  { id: "huts", label: "Vị trí & Chòi", icon: MapPin },
  { id: "staff", label: "Nhân sự", icon: Users },
  { id: "saas", label: "Gói dịch vụ SaaS", icon: CreditCard },
  { id: "appearance", label: "Giao diện", icon: Palette },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("lake");
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 select-none">
      
      {/* ── HEADER CARD ── */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cài đặt hệ thống
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Quản lý thông tin hồ câu, thiết lập giá vé, sơ đồ chòi và giao diện vận hành
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs sticky top-20 space-y-1">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl flex items-center gap-3 font-bold text-xs transition-all text-left",
                  activeSection === section.id 
                    ? "bg-emerald-600 text-white shadow-2xs" 
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <section.icon size={16} />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 max-w-4xl">
          {activeSection === "lake" && <LakeInfoForm />}
          {activeSection === "packages" && <PackageSettings />}
          {activeSection === "huts" && <HutSettings />}
          {activeSection === "staff" && <EmployeeSettings />}
          {activeSection === "saas" && <SaasBillingSettings />}
          
          {activeSection === "appearance" && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Monitor size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Giao diện người dùng</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Tùy chỉnh chế độ hiển thị hệ thống sáng hoặc tối.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme("light")}
                  className={cn(
                    "p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                    theme === "light" 
                      ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold" 
                      : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  )}
                >
                  <Sun size={28} />
                  <span className="font-bold text-xs">Chế độ Sáng (Mặc định)</span>
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                    theme === "dark" 
                      ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold" 
                      : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  )}
                >
                  <Moon size={28} />
                  <span className="font-bold text-xs">Chế độ Tối (Dark)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
