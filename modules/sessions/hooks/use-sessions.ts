"use client";

import { useState, useCallback } from "react";
import { FishingSession, SessionStatus } from "../types/session.types";

export function useSessions() {
  const [sessions, setSessions] = useState<FishingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    // Realtime logic will go here
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
  }, []);

  const getSessionStatus = (endTime: string): SessionStatus => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "EXPIRED";
    if (diff < 1000 * 60 * 15) return "WARNING";
    return "ACTIVE";
  };

  return {
    sessions,
    isLoading,
    refreshSessions,
    getSessionStatus
  };
}
