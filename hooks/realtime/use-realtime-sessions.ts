"use client";

import { useEffect } from "react";
import { realtimeService } from "@/services/realtime/realtime-service";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeSessions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = realtimeService.subscribeToSessions((payload) => {
      // Invalidate query to trigger refetch or update cache directly
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    });

    return () => {
      realtimeService.unsubscribe(channel);
    };
  }, [queryClient]);
}
