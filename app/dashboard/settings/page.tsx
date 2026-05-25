"use client";

import React, { useState } from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { LakeInfoForm } from "@/modules/settings/components/lake-info-form";
import { PackageSettings } from "@/modules/settings/components/package-settings";
import { HutSettings } from "@/modules/settings/components/hut-settings";
import { EmployeeSettings } from "@/modules/settings/components/employee-settings";
import { FishSettings } from "@/modules/settings/components/fish-settings";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Package, 
  MapPin, 
  Users, 
  Palette, 
  Bell,
  Monitor,
  Moon,
  Sun,
  Fish
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useTheme } from "next-themes";

const SETTINGS_SECTIONS = [
  { id: "lake", label: "Cấu hình Hồ", icon: Building2 },
  { id: "packages", label: "Gói dịch vụ", icon: Package },
  { id: "huts", label: "Ô Câu", icon: MapPin },
  { id: "fish", label: "Cá & Giá thu hồi", icon: Fish },
  { id: "staff", label: "Nhân sự", icon: Users },
  { id: "appearance", label: "Giao diện", icon: Palette },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("lake");
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Cài đặt hệ thống" 
          subtitle="Quản lý cấu hình vận hành, giao diện và nhân sự của hồ câu."
        />
      }
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="glass-card p-4 rounded-[2.5rem] sticky top-8">
            <div className="space-y-2">
              {SETTINGS_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full h-14 px-5 rounded-2xl flex items-center gap-4 font-black text-xs uppercase tracking-widest transition-all",
                    activeSection === section.id 
                      ? "bg-primary text-white shadow-xl shadow-primary/20" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <section.icon size={18} />
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-10 max-w-4xl">
          {activeSection === "lake" && <LakeInfoForm />}
          {activeSection === "packages" && <PackageSettings />}
          {activeSection === "huts" && <HutSettings />}
          {activeSection === "fish" && <FishSettings />}
          {activeSection === "staff" && <EmployeeSettings />}
          
          {activeSection === "appearance" && (
            <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Giao diện người dùng</h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Tùy chỉnh chế độ hiển thị hệ thống.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme("light")}
                  className={cn(
                    "p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all",
                    theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-accent/50 text-muted-foreground"
                  )}
                >
                  <Sun size={32} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Sáng (Light)</span>
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all",
                    theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-accent/50 text-muted-foreground"
                  )}
                >
                  <Moon size={32} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Tối (Dark)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
