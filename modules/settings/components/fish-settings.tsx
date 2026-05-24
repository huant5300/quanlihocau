"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { Fish, Plus, Loader2, DollarSign, Calendar, User, MapPin } from "lucide-react";
import { fishService } from "@/services/api/fish-service";
import { axiosApiClient } from "@/services/api/axios-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function FishSettings() {
  const [fishTypes, setFishTypes] = useState<any[]>([]);
  const [catches, setCatches] = useState<any[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingCatches, setIsLoadingCatches] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newFishName, setNewFishName] = useState("");
  const [newFishPrice, setNewFishPrice] = useState("");

  useEffect(() => {
    loadFishTypes();
    loadCatches();
  }, []);

  const loadFishTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const data = await fishService.getFishTypes();
      setFishTypes(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách loại cá");
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const loadCatches = async () => {
    setIsLoadingCatches(true);
    try {
      const response = await axiosApiClient.get<any[]>("/api/v1/fish/catches");
      if (response.success && response.data) {
        setCatches(response.data);
      } else {
        setCatches([]);
      }
    } catch (error) {
      console.error("Failed to load catches", error);
    } finally {
      setIsLoadingCatches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFishName || !newFishPrice) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsSaving(true);
    try {
      await fishService.createFishType({
        name: newFishName,
        buybackPrice: Number(newFishPrice)
      });
      toast.success("Đã thêm loại cá mới");
      setNewFishName("");
      setNewFishPrice("");
      setIsOpen(false);
      loadFishTypes();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi lưu loại cá");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <SettingsCard 
        title="Quản Lý Loại Cá & Giá Thu Hồi" 
        description="Cấu hình danh mục các loại cá hỗ trợ thu mua lại từ khách câu và đơn giá trên mỗi kg."
        icon={Fish}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingTypes ? (
              <div className="col-span-2 flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : fishTypes.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-muted-foreground font-medium uppercase text-[10px] tracking-widest bg-accent/10 rounded-[2rem]">
                Chưa có loại cá nào được cấu hình
              </div>
            ) : (
              fishTypes.map((fish) => (
                <div 
                  key={fish.id} 
                  className="p-5 bg-accent/30 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-accent/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Fish size={24} />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">{fish.name}</p>
                      <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                        Giá thu hồi: <span className="text-primary font-black">{Number(fish.buybackPrice).toLocaleString()}đ/kg</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => setIsOpen(true)}
            className="w-full h-16 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Plus size={18} />
            Thêm loại cá mới
          </button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">
                  Thêm loại cá mới
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tên loại cá</label>
                  <input 
                    value={newFishName}
                    onChange={(e) => setNewFishName(e.target.value)}
                    required
                    className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    placeholder="Cá Trắm, Cá Chép, Cá Trôi..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giá thu hồi (VNĐ/kg)</label>
                  <input 
                    type="number"
                    value={newFishPrice}
                    onChange={(e) => setNewFishPrice(e.target.value)}
                    required
                    className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                    placeholder="e.g. 50000"
                  />
                </div>
                <DialogFooter className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Thêm loại cá
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Lịch Sử Thu Mua Cá"
        description="Nhật ký chi tiết các lượt thu hồi cá từ các phiên câu hoạt động của khách hàng."
        icon={DollarSign}
      >
        <div className="overflow-x-auto no-scrollbar">
          {isLoadingCatches ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : catches.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-medium uppercase text-[10px] tracking-widest bg-accent/10 rounded-[2rem]">
              Chưa có lịch sử thu mua cá nào
            </div>
          ) : (
            <div className="min-w-full space-y-4">
              {catches.map((item) => (
                <div 
                  key={item.id}
                  className="p-6 bg-accent/20 border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent/30 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center font-black">
                      +{Number(item.weight)}kg
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                        {item.fishType?.name}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {item.session?.customer?.fullName || "Khách lẻ"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          Ô {item.session?.area?.name || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Đơn giá: {Number(item.buybackPrice).toLocaleString()}đ/kg
                    </p>
                    <p className="font-black text-lg text-primary tracking-tighter mt-1">
                      -{Number(item.totalAmount).toLocaleString()}đ
                    </p>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full">
                      Trừ vào hóa đơn
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
