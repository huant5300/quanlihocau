"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { QuickActions } from "@/modules/dashboard/components/quick-actions";
import { StatsCards } from "@/modules/dashboard/components/stats-cards";
import { SessionGrid } from "@/modules/dashboard/components/session-grid";
import { useDashboardData } from "@/modules/dashboard/hooks/use-dashboard-data";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { AlertCircle, X, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";

import { FishingSession } from "@/types/sessions";
import { SessionCard } from "@/modules/dashboard/components/session-card";

const MOCK_SESSIONS: FishingSession[] = [
  {
    id: "1",
    hut_number: "08",
    customer_name: "Nguyễn Văn A",
    phone_number: "0912345678",
    end_time: new Date(Date.now() + 1000 * 60 * 12).toISOString(),
    total_amount: 450000,
    product_count: 3,
    status: "ACTIVE"
  },
  {
    id: "2",
    hut_number: "12",
    customer_name: "Trần Thị B",
    phone_number: "0987654321",
    end_time: new Date(Date.now() + 1000 * 60 * 125).toISOString(),
    total_amount: 120000,
    product_count: 1,
    status: "ACTIVE"
  }
];

export default function DashboardPage() {
  const { stats, sessions: realSessions, isLoading } = useDashboardData();
  const { setOpenSessionModalOpen } = useUIStore();
  
  const sessions = realSessions?.length ? realSessions : MOCK_SESSIONS;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Tổng quan" 
          subtitle="Chào mừng bạn trở lại, chúc bạn một ngày bội thu!"
          actions={
            <button 
              onClick={() => setOpenSessionModalOpen(true)}
              className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Mở lượt mới</span>
            </button>
          }
        />
      }
    >
      <div className="space-y-10">
        {/* Realtime Alert Banner */}
        <AnimatePresence>
          {stats?.active_alerts ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-orange-500 text-white px-6 py-4 rounded-[2rem] flex items-center justify-between shadow-xl shadow-orange-500/20 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-wider">Cảnh báo hệ thống</p>
                    <p className="text-xs font-bold opacity-90 mt-1">
                      Có {stats.active_alerts} hồ cần kiểm tra chất lượng nước ngay lập tức!
                    </p>
                  </div>
                </div>
                <button className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Stats Section */}
        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Sessions - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Lượt câu đang hoạt động</h2>
              </div>
              <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {sessions.length} Đang câu
              </span>
            </div>
            
            <SessionGrid 
              isEmpty={!sessions || sessions.length === 0} 
              count={sessions?.length || 0}
            >
              {sessions?.map((session: any) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </SessionGrid>
          </div>

          {/* Quick Actions & Activity - Side Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Thao tác nhanh</h2>
              <QuickActions />
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground">Gợi ý hôm nay</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-xs font-black text-primary uppercase">Mẹo doanh thu</p>
                  <p className="text-sm font-bold mt-1">Giảm giá 10% gói 5h cho khách quen trong hôm nay.</p>
                </div>
                <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                  <p className="text-xs font-black text-orange-500 uppercase">Vận hành</p>
                  <p className="text-sm font-bold mt-1">Kiểm tra lại lượng mồi câu tại kho 1.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
