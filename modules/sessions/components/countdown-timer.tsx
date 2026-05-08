"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/utils";

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  onWarning?: () => void;
}

export function CountdownTimer({ endTime, onExpire, onWarning }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
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
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire, onWarning, isWarning]);

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
