"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { Waves, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";

const ACTIVE_SESSIONS = [
  { id: "1", hut: "08", name: "Nguyễn Văn A", time: "1h 45m" },
  { id: "2", hut: "12", name: "Trần Minh B", time: "2h 10m" },
  { id: "3", hut: "05", name: "Lê Hồng C", time: "0h 30m" },
];

export function ActiveSessionsOverview() {
  return (
    <DashboardWidget 
      title="Lượt câu đang hoạt động" 
      subtitle="Tổng số 12 chòi đang có khách"
      icon={Waves}
    >
      <div className="space-y-4">
        {ACTIVE_SESSIONS.map((session, index) => (
          <div key={session.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl group cursor-pointer hover:bg-accent/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-black text-xs">
                {session.hut}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight">{session.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{session.time}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
          </div>
        ))}
        
        <button className="w-full h-12 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-2">
          Xem tất cả lượt câu
        </button>
      </div>
    </DashboardWidget>
  );
}
