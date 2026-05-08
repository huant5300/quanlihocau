"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { RealtimeStatusBar } from "@/modules/dashboard/widgets/realtime-status-bar";
import { ActiveSessionsOverview } from "@/modules/dashboard/widgets/active-sessions-overview";
import { RevenueSummary } from "@/modules/dashboard/widgets/revenue-summary";
import { QuickActions } from "@/modules/dashboard/widgets/quick-actions";
import { InventoryAlerts } from "@/modules/dashboard/widgets/inventory-alerts";
import { Plus, LayoutGrid, Bell } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export default function DashboardPage() {
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Bảng điều khiển POS" 
          subtitle="Tổng quan vận hành và các chỉ số thời gian thực của hồ câu."
          actions={
            <div className="flex items-center gap-3">
              <button className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-accent/80 transition-all active:scale-90 relative">
                <Bell size={24} />
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
              </button>
              <button 
                onClick={() => setOpenSessionModalOpen(true)}
                className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={20} strokeWidth={3} />
                <span className="hidden sm:inline">Mở lượt mới</span>
              </button>
            </div>
          }
        />
      }
    >
      <div className="space-y-2">
        <RealtimeStatusBar />
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-10">
          {/* Row 1 */}
          <div className="lg:col-span-1 xl:col-span-1">
            <QuickActions />
          </div>
          
          <div className="lg:col-span-1 xl:col-span-1">
            <RevenueSummary />
          </div>

          <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
            <ActiveSessionsOverview />
          </div>

          {/* Row 2 */}
          <div className="lg:col-span-1 xl:col-span-1">
            <InventoryAlerts />
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 text-white space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">VIP Khách hàng</h3>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">24 khách đang ở hồ</p>
              </div>
              <div className="flex -space-x-3 overflow-hidden pt-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="inline-block h-10 w-10 rounded-xl ring-4 ring-primary/20 bg-accent text-primary flex items-center justify-center font-black text-xs">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
            <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-tight">Hoạt động gần đây</h3>
                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-lg">Realtime</span>
              </div>
              <div className="space-y-4">
                {[
                  { user: "Hệ thống", action: "Đã đồng bộ 4 thao tác ngoại tuyến", time: "2 phút trước" },
                  { user: "Staff 01", action: "Vừa thanh toán Chòi 08 (265.000đ)", time: "5 phút trước" },
                  { user: "Hệ thống", action: "Cảnh báo hết mồi Cám Xanh", time: "15 phút trước" },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 h-10 bg-accent rounded-full shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-none">{act.user}</p>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1">{act.action}</p>
                      <p className="text-[9px] font-bold text-primary uppercase mt-1 opacity-60">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
