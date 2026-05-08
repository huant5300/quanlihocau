"use client";

import React from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { QuickActions } from "@/modules/dashboard/components/quick-actions";
import { StatsCards } from "@/modules/dashboard/components/stats-cards";
import { SessionGrid } from "@/modules/dashboard/components/session-grid";
import { useDashboardData } from "@/modules/dashboard/hooks/use-dashboard-data";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { FishingSession } from "@/types/sessions";
import { SessionCard } from "@/modules/dashboard/components/session-card";

const MOCK_SESSIONS: FishingSession[] = [
  {
    id: "1",
    hut_number: "08",
    customer_name: "Nguyễn Văn A",
    phone_number: "0912345678",
    end_time: new Date(Date.now() + 1000 * 60 * 12).toISOString(), // 12 mins left (Warning)
    total_amount: 450000,
    product_count: 3,
    status: "ACTIVE"
  },
  {
    id: "2",
    hut_number: "12",
    customer_name: "Trần Thị B",
    phone_number: "0987654321",
    end_time: new Date(Date.now() + 1000 * 60 * 125).toISOString(), // 2h+ left
    total_amount: 120000,
    product_count: 1,
    status: "ACTIVE"
  },
  {
    id: "3",
    hut_number: "01",
    customer_name: "Lê Văn C",
    phone_number: "0333444555",
    end_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // Expired
    total_amount: 890000,
    product_count: 5,
    status: "EXPIRED"
  }
];

export default function DashboardPage() {
  const { stats, sessions: realSessions, isLoading } = useDashboardData();
  
  // Use mock data if no real sessions found for demo purposes
  const sessions = realSessions?.length ? realSessions : MOCK_SESSIONS;

  if (isLoading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
              <div className="bg-orange-500 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg shadow-orange-500/20 mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="font-bold text-sm">
                    Có {stats.active_alerts} hồ cần kiểm tra chất lượng nước ngay lập tức!
                  </span>
                </div>
                <button className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Stats Section */}
        <section>
          <StatsCards stats={stats} />
        </section>

        {/* Quick Actions Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-black">Thao tác nhanh</h2>
          <QuickActions />
        </section>

        {/* Active Sessions Grid */}
        <section>
          <SessionGrid 
            isEmpty={!sessions || sessions.length === 0} 
            count={sessions?.length || 0}
          >
            {sessions?.map((session: any) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </SessionGrid>
        </section>
      </div>
    </MainLayout>
  );
}
