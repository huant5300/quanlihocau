"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";
import { SessionStatus, FishingSession } from "@prisma/client";
import { toast } from "sonner";
import { useOfflineStore } from "@/stores/offline-store";

export function useSessions() {
  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOfflineStore();

  const { data: sessions = [], isLoading, error, refetch } = useQuery<FishingSession[]>({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getSessions(),
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const createSession = useMutation({
    mutationFn: (newSession: any) => sessionService.createSession(newSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Đã mở lượt câu mới thành công!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Lỗi khi mở lượt câu");
    }
  });

  const updateSessionStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SessionStatus }) =>
      sessionService.updateSession(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Lỗi khi cập nhật trạng thái");
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
