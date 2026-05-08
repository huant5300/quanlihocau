"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeSubscription } from "@/services/realtime-service";

import { DashboardStats } from "@/types/dashboard";

export function useDashboardData() {
  const supabase = createClient();

  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_stats")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as DashboardStats;
    },
  });

  // Fetch Active Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("status", "ACTIVE")
        .order("start_time", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Subscriptions
  useRealtimeSubscription({ table: "sessions", queryKey: ["active-sessions"] });
  useRealtimeSubscription({ table: "dashboard_stats", queryKey: ["dashboard-stats"] });

  return {
    stats,
    sessions,
    isLoading: statsLoading || sessionsLoading,
  };
}
