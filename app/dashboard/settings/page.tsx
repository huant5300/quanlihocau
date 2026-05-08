"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Building2, 
  Clock, 
  Hash, 
  Users, 
  Tag,
  Save,
  Plus,
  Trash2,
  Mail,
  ShieldCheck
} from "lucide-react";
import { MainLayout } from "@/components/layouts/main-layout";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type SettingsTab = "general" | "packages" | "huts" | "employees" | "products";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const tabs = [
    { id: "general", label: "Cơ bản", icon: Building2 },
    { id: "packages", label: "Gói câu", icon: Clock },
    { id: "huts", label: "Quản lý Chòi", icon: Hash },
    { id: "employees", label: "Nhân viên", icon: Users },
    { id: "products", label: "Sản phẩm", icon: Tag },
  ];

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Settings size={28} />
              <h1 className="text-3xl font-black tracking-tight">Cấu hình Hệ thống</h1>
            </div>
            <p className="text-muted-foreground">Thiết lập thông tin hồ câu, giá cả và nhân sự.</p>
          </div>
          <button className="h-14 bg-primary text-white px-8 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Save size={20} /> Lưu thay đổi
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 rounded-t-2xl font-bold text-sm transition-all relative",
                activeTab === tab.id 
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "general" && <GeneralSettings />}
              {activeTab === "packages" && <PackageSettings />}
              {activeTab === "huts" && <HutSettings />}
              {activeTab === "employees" && <EmployeeSettings />}
              {activeTab === "products" && <ProductSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

// Sub-components for each tab
function GeneralSettings() {
  return (
    <div className="max-w-2xl space-y-8 bg-card p-8 rounded-[2.5rem] border-2 border-border/50">
      <h3 className="font-black text-xl">Thông tin Cơ sở</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tên hồ câu</label>
          <input className="w-full h-14 px-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold" placeholder="Fishing Paradise" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Địa chỉ</label>
          <input className="w-full h-14 px-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold" placeholder="123 Đường ven sông, Quận 7, TP.HCM" />
        </div>
      </div>
    </div>
  );
}

function PackageSettings() {
  const [packages, setPackages] = useState([
    { id: "1", name: "Câu giờ", price: 40000, type: "HOURLY" },
    { id: "2", name: "Ca sáng (6h-12h)", price: 200000, type: "FIXED" },
    { id: "3", name: "Ca chiều (12h-18h)", price: 200000, type: "FIXED" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-xl">Danh sách Gói câu</h3>
        <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
          <Plus size={18} /> Thêm gói
        </button>
      </div>
      <div className="grid gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="p-6 bg-card border-2 border-border/50 rounded-3xl flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary">
                <Clock size={24} />
              </div>
              <div>
                <p className="font-bold">{pkg.name}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase">{pkg.price.toLocaleString()}đ • {pkg.type === "HOURLY" ? "Tính theo giờ" : "Khoán theo ca"}</p>
              </div>
            </div>
            <button className="p-3 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HutSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-xl">Hệ thống Chòi</h3>
        <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
          <Plus size={18} /> Thêm chòi
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-card border-2 border-border/50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-primary/20 transition-all cursor-pointer">
            <span className="text-2xl font-black">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Trống</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeSettings() {
  return (
    <div className="space-y-8">
      <div className="max-w-xl space-y-4 bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10">
        <div className="flex items-center gap-3 text-primary mb-4">
          <ShieldCheck size={24} />
          <h3 className="font-black text-lg">Mời Nhân viên</h3>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input className="w-full h-14 pl-12 pr-4 bg-background rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold" placeholder="Email nhân viên..." />
          </div>
          <button className="h-14 bg-primary text-white px-6 rounded-2xl font-bold">Mời</button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-xl">Danh sách Nhân sự</h3>
        <div className="bg-card border-2 rounded-3xl overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-xl" />
              <div>
                <p className="font-bold">Nguyễn Nhân Viên</p>
                <p className="text-xs text-muted-foreground">nv@fishing.com</p>
              </div>
            </div>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full uppercase">Staff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSettings() {
  return (
    <div className="max-w-2xl space-y-8 bg-card p-8 rounded-[2.5rem] border-2 border-border/50">
      <h3 className="font-black text-xl">Danh mục Sản phẩm</h3>
      <div className="space-y-4">
        {["Mồi câu", "Thức ăn", "Đồ uống", "Dụng cụ"].map((cat) => (
          <div key={cat} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
            <span className="font-bold">{cat}</span>
            <button className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button className="w-full h-14 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 font-bold text-muted-foreground hover:border-primary/20 hover:text-primary transition-all">
          <Plus size={20} /> Thêm danh mục mới
        </button>
      </div>
    </div>
  );
}
