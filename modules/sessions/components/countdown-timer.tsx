"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/utils";


interface CountdownTimerProps {
  endTime: string;
  startTime?: string;
  sessionId: string;
  onExpire?: () => void;
  onWarning?: () => void;
  showTimes?: boolean; // Show start/end time labels
}

type TimerColor = "green" | "orange" | "red";

export function CountdownTimer({ endTime, startTime, sessionId, onExpire, onWarning, showTimes = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [timerColor, setTimerColor] = useState<TimerColor>("green");
  const [currentEndTime, setCurrentEndTime] = useState(endTime);

  const calculateTime = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(currentEndTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("00:00:00");
      setTimerColor("red");
      onExpire?.();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalMinutes = hours * 60 + minutes;

    // 3-tier color system
    if (totalMinutes < 15) {
      setTimerColor("red");
      if (timerColor !== "red") {
        onWarning?.();
      }
    } else if (totalMinutes < 60) {
      setTimerColor("orange");
    } else {
      setTimerColor("green");
    }

    setTimeLeft(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  }, [currentEndTime, onExpire, onWarning, timerColor]);

  // Update currentEndTime when prop changes (from realtime updates)
  useEffect(() => {
    setCurrentEndTime(endTime);
  }, [endTime]);

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
      {showTimes && (
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
