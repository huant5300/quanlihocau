"use client";

import { useEffect, useCallback } from "react";
import { realtimeService } from "@/services/realtime/realtime-service";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineStore } from "@/stores/offline-store";
import { toast } from "sonner";
import type { FishingSession } from "@/modules/sessions/types/session.types";

export function useRealtimeSessions() {
  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOfflineStore();

  const handleSessionChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Optimistic updates for online state
    if (isOnline) {
      switch (eventType) {
        case "INSERT":
          // Add new session to cache
          queryClient.setQueryData(["sessions"], (oldData: FishingSession[] | undefined) => {
            if (!oldData) return [newRecord];
            return [...oldData, newRecord];
          });
          toast.success(`Lượt câu mới được mở cho chòi ${newRecord.hut_number}`);
          break;

        case "UPDATE":
          // Update existing session in cache
          queryClient.setQueryData(["sessions"], (oldData: FishingSession[] | undefined) => {
            if (!oldData) return [];
            return oldData.map(session =>
              session.id === newRecord.id ? { ...session, ...newRecord } : session
            );
          });

          // Specific notifications based on status changes
          if (oldRecord.status !== newRecord.status) {
            switch (newRecord.status) {
              case "COMPLETED":
                toast.success(`Lượt câu chòi ${newRecord.hut_number} đã hoàn thành`);
                break;
              case "WARNING":
                toast.warning(`Lượt câu chòi ${newRecord.hut_number} sắp hết thời gian`);
                break;
              case "EXPIRED":
                toast.error(`Lượt câu chòi ${newRecord.hut_number} đã hết thời gian`);
                break;
            }
          }
          break;

        case "DELETE":
          // Remove session from cache
          queryClient.setQueryData(["sessions"], (oldData: FishingSession[] | undefined) => {
            if (!oldData) return [];
            return oldData.filter(session => session.id !== oldRecord.id);
          });
          toast.info(`Lượt câu chòi ${oldRecord.hut_number} đã được xóa`);
          break;
      }
    }

    // Always invalidate to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }, [queryClient, isOnline]);

  const handlePaymentChange = useCallback((payload: any) => {
    const { eventType, new: newRecord } = payload;

    if (eventType === "INSERT" && isOnline) {
      toast.success(`Thanh toán thành công cho chòi ${newRecord.hut_number || "N/A"}`);
      // Invalidate sessions to update payment status
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  }, [queryClient, isOnline]);

  const handleProductChange = useCallback((payload: any) => {
    const { eventType, new: newRecord } = payload;

    if (eventType === "UPDATE" && isOnline) {
      // Product price changes might affect session totals
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  }, [queryClient, isOnline]);

  useEffect(() => {
    const sessionChannel = realtimeService.subscribeToSessions(handleSessionChange);
    const paymentChannel = realtimeService.subscribeToPayments(handlePaymentChange);
    const productChannel = realtimeService.subscribeToProducts(handleProductChange);

    return () => {
      realtimeService.unsubscribe("active-sessions");
      realtimeService.unsubscribe("payments");
      realtimeService.unsubscribe("products");
    };
  }, [handleSessionChange, handlePaymentChange, handleProductChange]);
}

// Hook for individual session realtime updates (for detailed views)
export function useRealtimeSession(sessionId: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStore();

  const handleSessionUpdate = useCallback((payload: any) => {
    if (isOnline) {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      // Also update the sessions list
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  }, [queryClient, sessionId, isOnline]);

  useEffect(() => {
    const channel = realtimeService.subscribeToSessionUpdates(sessionId, handleSessionUpdate);

    return () => {
      realtimeService.unsubscribe(`session-${sessionId}`);
    };
  }, [sessionId, handleSessionUpdate]);
}
