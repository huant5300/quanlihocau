"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "@/services/supabase/session-service";
import { FishingSession } from "../types/session.types";
import { toast } from "sonner";

export function useSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getActiveSessions(),
    refetchOnWindowFocus: true,
  });

  const createSession = useMutation({
    mutationFn: (newSession: Partial<FishingSession>) => sessionService.createSession(newSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Đã mở lượt câu mới thành công!");
    },
    onError: (error: any) => {
      toast.error("Lỗi khi mở lượt câu", {
        description: error.message
      });
    }
  });

  const updateSessionStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FishingSession["status"] }) => 
      sessionService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: any) => {
      toast.error("Lỗi khi cập nhật trạng thái", {
        description: error.message
      });
    }
  });

  return {
    sessions,
    isLoading,
    error,
    createSession,
    updateSessionStatus,
  };
}
