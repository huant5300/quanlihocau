"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { Waves, ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import { useSessions } from "@/modules/sessions/hooks/use-sessions";
import { useRealtimeSessions } from "@/hooks/realtime/use-realtime-sessions";
import { differenceInMinutes, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function ActiveSessionsOverview() {
  const { sessions, isLoading } = useSessions();
  useRealtimeSessions(); // Enable realtime updates

  const formatElapsedTime = (startTime: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(startTime));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <DashboardWidget
      title="Lượt câu đang hoạt động"
      subtitle={isLoading ? "Đang tải dữ liệu..." : `Tổng số ${sessions.length} chòi đang có khách`}
      icon={Waves}
      headerAction={
        <motion.div
          animate={{ rotate: isLoading ? 360 : 0 }}
          transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
        >
          <RefreshCcw size={16} className="text-muted-foreground" />
        </motion.div>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary/40" size={32} />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Đang cập nhật...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-10 text-center space-y-2 border-2 border-dashed border-border/50 rounded-3xl">
            <p className="text-xs font-bold text-muted-foreground">Hiện chưa có lượt câu nào</p>
            <p className="text-[10px] uppercase font-black text-primary">Mở lượt mới ngay</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sessions.slice(0, 4).map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl group cursor-pointer hover:bg-accent/50 transition-all border border-transparent hover:border-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-black text-xs shadow-sm">
                    {session.hut_number}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{session.customer_name || "Khách lẻ"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{formatElapsedTime(session.start_time)}</p>
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && sessions.length > 0 && (
          <button className="w-full h-12 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-2">
            Xem tất cả {sessions.length} lượt câu
          </button>
        )}
      </div>
    </DashboardWidget>
  );
}
