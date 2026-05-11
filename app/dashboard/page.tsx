"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { RealtimeStatusBar } from "@/modules/dashboard/widgets/realtime-status-bar";
import { ActiveSessionsOverview } from "@/modules/dashboard/widgets/active-sessions-overview";
import { RevenueSummary } from "@/modules/dashboard/widgets/revenue-summary";
import { QuickActions } from "@/modules/dashboard/widgets/quick-actions";
import { InventoryAlerts } from "@/modules/dashboard/widgets/inventory-alerts";
import { LayoutGrid, Loader2 } from "lucide-react";
import { useDashboardData } from "@/modules/dashboard/hooks/use-dashboard-data";
import { DashboardHeaderActions } from "@/modules/dashboard/widgets/dashboard-header-actions";

export default function DashboardPage() {
  const { stats, sessions, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const dashboardStats = stats || {
    activeCount: 0,
    todayRevenue: 0,
    customerCount: 0,
    lowStockCount: 0,
  };

  const activeSessions = Array.isArray(sessions) ? sessions : (sessions as any)?.results || [];

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Bảng điều khiển POS"
          subtitle="Tổng quan vận hành và các chỉ số thời gian thực của hồ câu."
          actions={<DashboardHeaderActions />}
        />
      }
    >
      <div className="space-y-2">
        <RealtimeStatusBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-10">
          <div className="lg:col-span-1 xl:col-span-1">
            <QuickActions />
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <RevenueSummary 
              initialRevenue={dashboardStats.todayRevenue} 
              sessionRevenue={(dashboardStats as any).sessionRevenue}
              productRevenue={(dashboardStats as any).productRevenue}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
            <ActiveSessionsOverview initialSessions={activeSessions} />
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <InventoryAlerts count={dashboardStats.lowStockCount} />
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 text-white space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">Khách hàng</h3>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{dashboardStats.customerCount} khách trên hệ thống</p>
              </div>
              <div className="flex -space-x-3 overflow-hidden pt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex h-10 w-10 rounded-xl ring-4 ring-primary/20 bg-accent text-primary items-center justify-center font-black text-xs">
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
                {activeSessions.slice(0, 3).map((session: any, i: number) => (
                  <div key={session.id || i} className="flex gap-4">
                    <div className="w-1 h-10 bg-accent rounded-full shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-none">{session.customer_name || "Khách lẻ"}</p>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1">
                        {session.status === "ACTIVE" ? `Vừa mở lượt câu tại Chòi ${session.hut_number}` : `Đang câu tại Chòi ${session.hut_number}`}
                      </p>
                    </div>
                  </div>
                ))}
                {activeSessions.length === 0 && (
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center py-4">Chưa có hoạt động mới</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
