"use client";

import React, { useState } from "react";
import { Plus, Timer, User, MapPin, Fish, CheckCircle2, MoreVertical, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startFishingAction, completeFishingAction } from "@/actions/session-actions";
import { toast } from "sonner";

export function SessionsClient({ initialSessions, availableAreas, customers }: any) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartSession = async (formData: FormData) => {
    const areaId = formData.get("areaId") as string;
    const customerId = formData.get("customerId") as string;
    
    const result = await startFishingAction("lake_01", areaId, customerId);
    if (result.success) {
      toast.success("Đã mở lượt câu mới");
      setIsModalOpen(false);
      // Re-fetch or update local state
    } else {
      toast.error(result.error);
    }
  };

  const handleComplete = async (sessionId: string) => {
    const result = await completeFishingAction(sessionId);
    if (result.success) {
      toast.success("Đã hoàn tất lượt câu");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-black uppercase tracking-tighter flex items-center gap-3 shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          Mở lượt câu mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {sessions.map((session: any) => (
            <motion.div
              key={session.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8 rounded-[3rem] group hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Fish size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight uppercase">{session.area.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer size={12} />
                      Bắt đầu: {formatDistanceToNow(new Date(session.startTime), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase">
                  Đang câu
                </Badge>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Khách hàng</span>
                  <span className="text-sm font-bold">{session.customer?.fullName || "Khách lẻ"}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Đơn giá</span>
                  <span className="text-sm font-black">{Number(session.hourlyRate).toLocaleString()}đ/h</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  className="h-12 rounded-2xl border-white/10 hover:bg-white/5 font-bold"
                >
                  Ghi chú
                </Button>
                <Button 
                  onClick={() => handleComplete(session.id)}
                  className="h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase text-xs"
                >
                  Thanh toán
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Simplified Open Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-muted-foreground hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Mở lượt câu mới</h2>
            
            <form action={handleStartSession} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Chọn Chòi / Khu vực</label>
                <select name="areaId" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                  {availableAreas.map((area: any) => (
                    <option key={area.id} value={area.id} className="bg-[#0f0f0f]">{area.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Hội viên (Tùy chọn)</label>
                <select name="customerId" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                  <option value="" className="bg-[#0f0f0f]">Khách lẻ</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id} className="bg-[#0f0f0f]">{c.fullName} - {c.phone}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full h-16 bg-primary text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 mt-4">
                Xác nhận mở hồ
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
