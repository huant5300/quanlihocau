"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { Package, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
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

export function PackageSettings() {
  const [packages, setPackages] = useState<
    Array<{ id: string; name: string; duration_hours: number; price: number; is_active: boolean }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getPackages();
      setPackages(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách gói câu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name");
      const duration_hours = Number(formData.get("duration")) / 60;
      const price = Number(formData.get("price"));
      
      if (!name || Number.isNaN(duration_hours) || Number.isNaN(price)) {
        toast.error("Thông tin không hợp lệ");
        return;
      }

      await settingsService.createPackage({
        name,
        duration_hours,
        price,
        is_active: true
      });
      
      toast.success("Đã thêm gói câu mới");
      setIsOpen(false);
      loadPackages();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thêm gói câu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa gói này?")) return;
    try {
      await settingsService.deletePackage(id);
      toast.success("Đã xóa gói câu");
      loadPackages();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa gói câu");
    }
  };

  return (
    <SettingsCard 
      title="Gói Câu cá" 
      description="Cấu hình thời gian và đơn giá các gói dịch vụ."
      icon={Package}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="p-5 bg-accent/30 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-accent/50 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-xs">
                  {pkg.duration_hours || (pkg as any).duration / 60}h
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">{pkg.name}</p>
                  <p className="text-xs font-bold text-primary mt-1">{pkg.price.toLocaleString()}đ</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-3 bg-background hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="p-3 bg-background hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}

        <button 
          onClick={() => setIsOpen(true)}
          className="w-full h-16 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all"
        >
          <Plus size={18} />
          Thêm gói mới
        </button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm gói câu mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPackage} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tên gói</label>
                <input 
                  name="name"
                  required
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="Gói 5 giờ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời gian (phút)</label>
                  <input 
                    name="duration"
                    type="number"
                    required
                    className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    placeholder="300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giá (đ)</label>
                  <input 
                    name="price"
                    type="number"
                    required
                    className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    placeholder="250000"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="h-14 px-8 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Thêm gói
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsCard>
  );
}
