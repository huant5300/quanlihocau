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
        sessionRevenue: data.sessionRevenue || 0,
        productRevenue: data.productRevenue || 0,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000, // Poll every 60s for stats (rely on mutations for updates)
    refetchOnWindowFocus: true,
  });

  // Fetch Active Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      return await sessionService.getSessions("ACTIVE");
    },
    staleTime: 30000,
    refetchInterval: 60000, // Poll every 60s for active sessions
    refetchOnWindowFocus: true,
  });

  return {
    stats,
    sessions,
    isLoading: statsLoading || sessionsLoading,
  };
}
