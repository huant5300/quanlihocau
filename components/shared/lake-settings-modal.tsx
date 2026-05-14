"use client";

import React, { useState, useEffect } from "react";
import { X, Settings, MapPin, Hash, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { settingsService, LakeInfo } from "@/services/api/settings-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LakeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LakeSettingsModal({ isOpen, onClose }: LakeSettingsModalProps) {
  const queryClient = useQueryClient();
  const { data: lakeInfo, isLoading: isLoadingInfo } = useQuery({
    queryKey: ["lake-info"],
    queryFn: () => settingsService.getLakeInfo(),
    enabled: isOpen
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LakeInfo>();

  useEffect(() => {
    if (lakeInfo) {
      reset(lakeInfo);
    }
  }, [lakeInfo, reset]);

  const mutation = useMutation({
    mutationFn: (data: LakeInfo) => settingsService.updateLakeInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lake-info"] });
      queryClient.invalidateQueries({ queryKey: ["huts"] });
      toast.success("Cập nhật cài đặt hồ thành công!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật cài đặt");
    }
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Settings size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Cài đặt hồ câu</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tên hồ câu</Label>
                <div className="relative">
                  <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    {...register("name", { required: "Vui lòng nhập tên hồ" })}
                    placeholder="VD: Hồ Câu Đồng Quê" 
                    className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    {...register("address", { required: "Vui lòng nhập địa chỉ" })}
                    placeholder="Số 123, Đường ABC..." 
                    className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                  />
                </div>
                {errors.address && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Số lượng ô câu</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    {...register("totalSpots", { required: "Vui lòng nhập số lượng", min: 1 })}
                    type="number"
                    placeholder="30" 
                    className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                  />
                </div>
                {errors.totalSpots && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.totalSpots.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={mutation.isPending || isLoadingInfo}
              className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
