"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { settingsService } from "@/services/api/settings-service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function HutSettings() {
  const [huts, setHuts] = useState<Array<{ id: string; number: string; status: string; capacity: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHuts();
  }, []);

  const loadHuts = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getHuts();
      setHuts(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách chòi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const number = formData.get("number");
      const capacity = Number(formData.get("capacity"));
      
      if (!number || Number.isNaN(capacity)) {
        toast.error("Thông tin chòi không hợp lệ");
        return;
      }

      await settingsService.createHut({
        number,
        capacity,
        status: "Available"
      });
      
      toast.success("Đã thêm chòi mới");
      setIsOpen(false);
      loadHuts();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thêm chòi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard 
      title="Quản lý Chòi" 
      description="Quản lý danh sách các chòi và vị trí câu."
      icon={MapPin}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          huts.map((hut) => (
            <div key={hut.id} className="p-4 bg-accent/30 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                hut.status === "Available" ? "bg-green-500 text-white" : 
                hut.status === "Maintenance" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
              )}>
                <span className="font-black text-lg">{hut.number}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {hut.status}
                </p>
                <p className="text-xs font-bold mt-1">Sức chứa: {hut.capacity}</p>
              </div>
            </div>
          ))
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 min-h-[120px]">
              <Plus size={20} className="text-muted-foreground" />
              <span className="text-[8px] font-black uppercase tracking-widest">Thêm chòi</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm chòi mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHut} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số chòi / Tên chòi</label>
                <input 
                  name="number"
                  required
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="04"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sức chứa (người)</label>
                <input 
                  name="capacity"
                  type="number"
                  required
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="4"
                  defaultValue="4"
                />
              </div>
              <DialogFooter className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="h-14 px-8 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Thêm chòi
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsCard>
  );
}
