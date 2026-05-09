"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { useSessions } from "@/modules/sessions/hooks/use-sessions";
import { useRealtimeSessions } from "@/hooks/realtime/use-realtime-sessions";
import { SessionGrid } from "@/modules/sessions/components/session-grid";
import { SessionCard } from "@/modules/sessions/components/session-card";
import { SessionEmptyState } from "@/modules/sessions/components/session-empty-state";
import { RealtimeStatusBar } from "@/modules/dashboard/widgets/realtime-status-bar";
import { Plus, Waves } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { motion } from "framer-motion";

export default function SessionsPage() {
  const { sessions, isLoading, createSession, updateSessionStatus } = useSessions();
  const { setOpenSessionModalOpen } = useUIStore();

  // Enable realtime updates
  useRealtimeSessions();

  const handleCreateSession = () => {
    setOpenSessionModalOpen(true);
  };

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Quản lý lượt câu"
          subtitle="Theo dõi và quản lý tất cả các lượt câu đang hoạt động."
          actions={
            <button
              onClick={handleCreateSession}
              className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Mở lượt mới</span>
            </button>
          }
        />
      }
    >
      <div className="space-y-6">
        <RealtimeStatusBar />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
            <span className="ml-4 text-lg font-semibold">Đang tải dữ liệu...</span>
          </div>
        ) : sessions.length === 0 ? (
          <SessionEmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SessionGrid>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isUpdating={updateSessionStatus.isPending && updateSessionStatus.variables?.id === session.id}
                />
              ))}
            </SessionGrid>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}