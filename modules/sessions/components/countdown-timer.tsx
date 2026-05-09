"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/utils";
import { useRealtimeSession } from "@/hooks/realtime/use-realtime-sessions";

interface CountdownTimerProps {
  endTime: string;
  sessionId: string;
  onExpire?: () => void;
  onWarning?: () => void;
}

export function CountdownTimer({ endTime, sessionId, onExpire, onWarning }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isWarning, setIsWarning] = useState(false);
  const [currentEndTime, setCurrentEndTime] = useState(endTime);

  // Listen for realtime updates to session end time
  useRealtimeSession(sessionId);

  const calculateTime = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(currentEndTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("00:00:00");
      onExpire?.();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours === 0 && minutes < 15 && !isWarning) {
      setIsWarning(true);
      onWarning?.();
    }

    setTimeLeft(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  }, [currentEndTime, onExpire, onWarning, isWarning]);

  // Update currentEndTime when prop changes (from realtime updates)
  useEffect(() => {
    setCurrentEndTime(endTime);
  }, [endTime]);

  useEffect(() => {
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [calculateTime]);

  return (
    <div className={cn(
      "flex items-center gap-2 font-black text-2xl tracking-tighter",
      isWarning ? "text-orange-500" : "text-foreground"
    )}>
      <Clock size={20} className={cn(isWarning && "animate-pulse")} />
      <span>{timeLeft}</span>
    </div>
  );
}
