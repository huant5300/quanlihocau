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
import { RotateCcw, Loader2, Fish } from "lucide-react";
import { sessionService } from "@/services/api/session-service";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fishService } from "@/services/api/fish-service";

interface FishBuybackModalProps {
  sessionId: string;
  hutNumber: string;
}

export function FishBuybackModal({ sessionId, hutNumber }: FishBuybackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: fishTypes = [] } = useQuery({
    queryKey: ["fish-types"],
    queryFn: () => fishService.getFishTypes(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const weight = parseFloat(formData.get("weight") as string);
      const fishTypeId = formData.get("fishTypeId") as string;
      const buybackPrice = parseInt(formData.get("buybackPrice") as string);

      await sessionService.buybackFish(sessionId, fishTypeId, weight, buybackPrice);
      toast.success("Đã ghi nhận thu mua cá");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể ghi nhận thu mua cá");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="h-12 bg-accent/50 hover:bg-accent rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
          <RotateCcw size={16} /> Thu cá
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-3">
            <Fish className="text-primary" />
            Thu mua cá - Chòi {hutNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Guidance Bar */}
        <div className="px-8 py-3 bg-primary/5 border-b border-primary/10 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
            Gợi ý: Chọn loại cá, nhập cân nặng và giá để trừ trực tiếp vào hóa đơn của khách
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Loại cá</label>
            <select 
              name="fishTypeId"
              required
              onChange={(e) => {
                const selectedType = fishTypes.find((t: any) => t.id === e.target.value);
                if (selectedType) {
                  const priceInput = document.getElementById("buyback-price-input") as HTMLInputElement;
                  if (priceInput) priceInput.value = Number(selectedType.buybackPrice).toString();
                }
              }}
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
            >
              <option value="">Chọn loại cá</option>
              {fishTypes.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({Number(type.buybackPrice).toLocaleString()}đ/kg)
                </option>
              ))}
              {fishTypes.length === 0 && (
                <>
                  <option value="CARP">Cá chép</option>
                  <option value="TILAPIA">Cá rô phi</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Khối lượng (Kg)</label>
              <input 
                name="weight"
                type="number"
                step="0.1"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="1.5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giá thu (đ/Kg)</label>
              <input 
                id="buyback-price-input"
                name="buybackPrice"
                type="number"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold transition-all"
                placeholder="25000"
                defaultValue="25000"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <RotateCcw size={20} />}
              Xác nhận thu cá
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
