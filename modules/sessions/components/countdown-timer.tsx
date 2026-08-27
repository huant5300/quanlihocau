"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/utils";


import { audioAlert } from "@/utils/audio-alert";

interface CountdownTimerProps {
  endTime: string;
  startTime?: string;
  sessionId: string;
  onExpire?: () => void;
  onWarning?: () => void;
  showTimes?: boolean; // Show start/end time labels
  enableSound?: boolean;
}

type TimerColor = "green" | "orange" | "red";

export function CountdownTimer({ 
  endTime, 
  startTime, 
  sessionId, 
  onExpire, 
  onWarning, 
  showTimes = false,
  enableSound = true 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [timerColor, setTimerColor] = useState<TimerColor>("green");
  const [currentEndTime, setCurrentEndTime] = useState(endTime);
  const [isMounted, setIsMounted] = useState(false);

  // Keep references to callbacks to avoid triggering recalculation/re-render loops
  const onWarningRef = useRef(onWarning);
  const onExpireRef = useRef(onExpire);

  // Track if callbacks have already been fired to prevent duplicates/loops
  const hasExpiredRef = useRef(false);
  const hasWarnedRef = useRef(false);

  // Update refs when props change
  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset flags when the session ends, or when endTime changes (e.g. extension)
  useEffect(() => {
    setCurrentEndTime(endTime);
    hasExpiredRef.current = false;
    hasWarnedRef.current = false;
  }, [endTime, sessionId]);

  const calculateTime = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(currentEndTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      const overdueMs = Math.abs(diff);
      const oHours = Math.floor(overdueMs / (1000 * 60 * 60));
      const oMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
      const oSeconds = Math.floor((overdueMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `+${oHours.toString().padStart(2, "0")}:${oMinutes.toString().padStart(2, "0")}:${oSeconds.toString().padStart(2, "0")}`
      );
      setTimerColor("red");
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        if (enableSound) audioAlert.playExpiredAlarm();
        onExpireRef.current?.();
      }
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalMinutes = hours * 60 + minutes;

    // 3-tier color system & SOS trigger
    if (totalMinutes < 15) {
      setTimerColor("red");
      if (!hasWarnedRef.current) {
        hasWarnedRef.current = true;
        if (enableSound) audioAlert.playWarningBeep();
        onWarningRef.current?.();
      }
    } else if (totalMinutes < 60) {
      setTimerColor("orange");
    } else {
      setTimerColor("green");
    }

    setTimeLeft(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  }, [currentEndTime]);

  useEffect(() => {
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [calculateTime]);

  const colorClasses: Record<TimerColor, string> = {
    green: "text-emerald-500",
    orange: "text-amber-500",
    red: "text-red-500",
  };

  const bgClasses: Record<TimerColor, string> = {
    green: "bg-emerald-500/10 border-emerald-500/20",
    orange: "bg-amber-500/10 border-amber-500/20",
    red: "bg-red-500/10 border-red-500/20",
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Start/End time labels */}
      {showTimes && isMounted && (
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>{formatTime(startTime)}</span>
          <span>→</span>
          <span>{formatTime(currentEndTime)}</span>
        </div>
      )}
      
      {/* Main countdown display */}
      <div className={cn(
        "flex items-center gap-1.5 font-black text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-tighter px-3 py-1 rounded-xl border transition-all",
        colorClasses[timerColor],
        bgClasses[timerColor],
        timerColor === "red" && "animate-pulse"
      )}>
        <Clock className={cn(
          "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0",
          timerColor === "red" && "animate-bounce"
        )} />
        <span>{timeLeft}</span>
      </div>
    </div>
  );
}
