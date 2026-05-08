"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/utils/utils";

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  onWarning?: () => void;
}

export function CountdownTimer({ endTime, onExpire, onWarning }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 900) { // 15 minutes
        onWarning?.();
      }

      if (remaining === 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire, onWarning]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft > 0 && timeLeft <= 900;
  const isExpired = timeLeft === 0;

  return (
    <div className={cn(
      "font-mono text-2xl font-black tracking-tighter tabular-nums transition-colors duration-500",
      isExpired ? "text-destructive" : isWarning ? "text-orange-500 animate-pulse" : "text-primary"
    )}>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
