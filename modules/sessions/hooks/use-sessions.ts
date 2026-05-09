"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "@/services/supabase/session-service";
import { FishingSession } from "../types/session.types";
import { toast } from "sonner";
import { useOfflineStore } from "@/stores/offline-store";

export function useSessions() {
  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOfflineStore();

  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getActiveSessions(),
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  const createSession = useMutation({
    mutationFn: (newSession: Partial<FishingSession>) => sessionService.createSession(newSession),
    onMutate: async (newSession) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["sessions"] });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<FishingSession[]>(["sessions"]);

      // Optimistically update
      if (isOnline) {
        const optimisticSession: FishingSession = {
          id: `temp-${Date.now()}`,
          hut_number: newSession.hut_number || "",
          customer_id: newSession.customer_id,
          customer_name: newSession.customer_name || "Khách lẻ",
          phone: newSession.phone || "",
          start_time: new Date().toISOString(),
          end_time: newSession.end_time || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          total_amount: newSession.total_amount || 0,
          product_count: 0,
          products: [],
          status: "ACTIVE",
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData<FishingSession[]>(["sessions"], (old) => old ? [...old, optimisticSession] : [optimisticSession]);
      }

      return { previousSessions };
    },
    onSuccess: (data, variables) => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        toast.success("Đã mở lượt câu mới thành công!");
      } else {
        // Queue for offline sync
        addToQueue({
          type: "OPEN_SESSION",
          payload: variables,
        });
        toast.success("Lượt câu đã được lưu và sẽ đồng bộ khi có kết nối!");
      }
    },
    onError: (error: any, variables, context) => {
      // Revert optimistic update
      if (context?.previousSessions) {
        queryClient.setQueryData(["sessions"], context.previousSessions);
      }

      if (isOnline) {
        toast.error("Lỗi khi mở lượt câu", {
          description: error.message
        });
      } else {
        toast.error("Không thể lưu lượt câu khi offline");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  });

  const updateSessionStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FishingSession["status"] }) => 
      sessionService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["sessions"] });
      const previousSessions = queryClient.getQueryData<FishingSession[]>(["sessions"]);

      // Optimistic update
      if (isOnline) {
        queryClient.setQueryData<FishingSession[]>(["sessions"], (old) =>
          old ? old.map(session => session.id === id ? { ...session, status } : session) : []
        );
      }

      return { previousSessions };
    },
    onSuccess: (data, { status }) => {
      if (isOnline) {
        toast.success(`Cập nhật trạng thái thành công: ${status}`);
      } else {
        addToQueue({
          type: "OPEN_SESSION", // Using OPEN_SESSION as generic type for now
          payload: { id: data.id, status },
        });
        toast.success("Trạng thái đã được cập nhật và sẽ đồng bộ!");
      }
    },
    onError: (error: any, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(["sessions"], context.previousSessions);
      }

      if (isOnline) {
        toast.error("Lỗi khi cập nhật trạng thái", {
          description: error.message
        });
      } else {
        toast.error("Không thể cập nhật khi offline");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  });

  return {
    sessions,
    isLoading,
    error,
    refetch,
    createSession,
    updateSessionStatus,
  };
}
