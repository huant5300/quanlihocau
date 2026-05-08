"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RealtimeConfig {
  table: string;
  queryKey: string[];
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
}

export function useRealtimeSubscription({ 
  table, 
  queryKey, 
  event = "*", 
  filter 
}: RealtimeConfig) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}-${filter || "all"}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter,
        },
        (payload) => {
          console.log(`Realtime change in ${table}:`, payload);
          
          // Smart Cache Invalidation
          queryClient.invalidateQueries({ queryKey });

          // Toast notification for specific events if needed
          if (payload.eventType === "INSERT") {
            // Optional: toast.info(`Dữ liệu mới trong ${table}`);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to ${table} realtime`);
        }
        if (status === "CHANNEL_ERROR") {
          toast.error("Lỗi kết nối thời gian thực. Đang thử lại...");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, table, queryKey, event, filter]);
}

/**
 * Specialized hook for Dashboard Realtime Sync
 */
export function useDashboardRealtime() {
  useRealtimeSubscription({ table: "sessions", queryKey: ["active-sessions"] });
  useRealtimeSubscription({ table: "dashboard_stats", queryKey: ["dashboard-stats"] });
}

/**
 * Specialized hook for Products Realtime Sync
 */
export function useProductsRealtime() {
  useRealtimeSubscription({ table: "products", queryKey: ["products"] });
}

/**
 * Specialized hook for Payments Realtime Sync
 */
export function usePaymentsRealtime() {
  useRealtimeSubscription({ table: "payments", queryKey: ["payments"] });
}
