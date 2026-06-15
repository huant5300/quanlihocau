"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, ArrowRight, Timer } from "lucide-react";
import { cn } from "@/utils/utils";

interface TimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  durationHours?: number;
}

export function TimePicker({ value, onChange, durationHours }: TimePickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!value) {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      onChange(`${hh}:${mm}`);
    }
  }, []);

  const endTime = useMemo(() => {
    if (!value || !durationHours) return null;
    const [hh, mm] = value.split(":").map(Number);
    if (isNaN(hh) || isNaN(mm)) return null;
    
    const totalMinutes = hh * 60 + mm + durationHours * 60;
    const endHH = Math.floor(totalMinutes / 60) % 24;
    const endMM = totalMinutes % 60;
    return `${endHH.toString().padStart(2, "0")}:${endMM.toString().padStart(2, "0")}`;
  }, [value, durationHours]);

  const remainingDisplay = useMemo(() => {
    if (!durationHours) return null;
    const hours = Math.floor(durationHours);
    const mins = Math.round((durationHours - hours) * 60);
    if (mins > 0) return `${hours}h${mins.toString().padStart(2, "0")}`;
    return `${hours} tiếng`;
  }, [durationHours]);

  return (
    <div className="space-y-4">
      {/* Time Input Row */}
      <div className="flex items-center gap-4">
        {/* Start Time */}
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Giờ bắt đầu
          </label>
          <div className="relative group">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10" size={20} />
            <input
              type="time"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-16 pl-12 pr-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-black text-2xl tracking-tight text-center"
            />
          </div>
        </div>

        {/* Arrow */}
        {durationHours && (
          <div className="flex flex-col items-center gap-1 pt-6">
            <ArrowRight size={24} className="text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
              +{remainingDisplay}
            </span>
          </div>
        )}

        {/* End Time Display */}
        {endTime && (
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Giờ kết thúc (dự kiến)
            </label>
            <div className="h-16 px-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400/50 dark:border-emerald-700/50 rounded-2xl flex items-center justify-center">
              <span className="font-black text-2xl text-emerald-700 dark:text-emerald-400 tracking-tight">
                {mounted ? endTime : "--:--"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Countdown Preview */}
      {durationHours && endTime && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-in slide-in-from-top-1">
          <Timer size={18} className="text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Thời gian câu</p>
            <p className="text-sm font-black text-foreground mt-0.5">
              {mounted ? value : "--:--"} → {mounted ? endTime : "--:--"} ({remainingDisplay})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
