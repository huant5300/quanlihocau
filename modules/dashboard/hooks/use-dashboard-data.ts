"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";
import type { DashboardStats, Session } from "@/types";

export function useDashboardData() {
  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const data = await sessionService.getStats();
      return {
        activeCount: data.activeCount || 0,
        todayRevenue: data.todayRevenue || 0,
        customerCount: data.customerCount || 0,
        lowStockCount: data.lowStockCount || 0,
      };
    },
  });

  // Fetch Active Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      return await sessionService.getSessions("ACTIVE");
    },
  });

  // Realtime is disabled for now as we migrated to Django.
  // Future: Use WebSockets with Django Channels.

  return {
    stats,
    sessions,
    isLoading: statsLoading || sessionsLoading,
  };
}
