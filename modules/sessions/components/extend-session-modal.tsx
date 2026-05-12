"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock, Loader2, Zap } from "lucide-react";
import { sessionService } from "@/services/api/session-service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ExtendSessionModalProps {
  sessionId: string;
  hutNumber: string;
}

export function ExtendSessionModal({ sessionId, hutNumber }: ExtendSessionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const hours = parseFloat(formData.get("hours") as string);
      const cost = parseInt(formData.get("cost") as string);

      await sessionService.extendSession(sessionId, hours, cost);
      toast.success("Đã gia hạn thành công");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể gia hạn phiên");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="h-12 bg-accent/50 hover:bg-accent rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
          <Clock size={16} /> Gia hạn
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-3">
            <Clock className="text-primary" />
            Gia hạn - Chòi {hutNumber}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số giờ gia hạn</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 5].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("hours-input") as HTMLInputElement;
                    const costInput = document.getElementById("cost-input") as HTMLInputElement;
                    if (input && costInput) {
                      input.value = h.toString();
                      costInput.value = (h * 50000).toString();
                    }
                  }}
                  className="h-12 rounded-xl bg-accent/50 hover:bg-primary hover:text-white font-black text-xs transition-all"
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giờ (số)</label>
              <input 
                id="hours-input"
                name="hours"
                type="number"
                step="0.5"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="1"
                onChange={(e) => {
                  const costInput = document.getElementById("cost-input") as HTMLInputElement;
                  if (costInput) {
                    costInput.value = (parseFloat(e.target.value || "0") * 50000).toString();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phụ phí (đ)</label>
              <input 
                id="cost-input"
                name="cost"
                type="number"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="50000"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              Xác nhận gia hạn
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
