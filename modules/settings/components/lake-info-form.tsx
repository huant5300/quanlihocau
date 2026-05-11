"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lakeSettingsSchema, LakeSettingsInput } from "../schemas/lake-settings.schema";
import { SettingsCard } from "./settings-card";
import { Building2, Save, Loader2 } from "lucide-react";
import { settingsService } from "@/services/api/settings-service";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function LakeInfoForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LakeSettingsInput>({
    resolver: zodResolver(lakeSettingsSchema),
  });

  const { data: lakeInfo, isLoading: isFetching } = useQuery({
    queryKey: ["lake-info"],
    queryFn: () => settingsService.getLakeInfo(),
  });

  useEffect(() => {
    if (lakeInfo) {
      reset({
        name: lakeInfo.name,
        address: lakeInfo.address,
        phone: lakeInfo.phone,
        receiptFooter: lakeInfo.receipt_footer,
      });
    }
  }, [lakeInfo, reset]);

  const mutation = useMutation({
    mutationFn: (data: LakeSettingsInput) => 
      settingsService.updateLakeInfo({
        name: data.name,
        address: data.address,
        phone: data.phone,
        receipt_footer: data.receiptFooter,
      }),
    onSuccess: () => {
      toast.success("Đã cập nhật thông tin hồ câu");
      queryClient.invalidateQueries({ queryKey: ["lake-info"] });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  });

  const onSubmit = (data: LakeSettingsInput) => {
    mutation.mutate(data);
  };

  return (
    <SettingsCard 
      title="Thông tin Hồ câu" 
      description="Quản lý thông tin thương hiệu và liên hệ."
      icon={Building2}
    >
      {isFetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tên Hồ câu</label>
            <input 
              {...register("name")}
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
            />
            {errors.name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</label>
            <input 
              {...register("phone")}
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Địa chỉ</label>
            <input 
              {...register("address")}
              className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lời chào hóa đơn</label>
            <textarea 
              {...register("receiptFooter")}
              className="w-full min-h-[100px] p-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold resize-none"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
              disabled={mutation.isPending}
              className="h-14 px-8 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </SettingsCard>
  );
}
