"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lakeSettingsSchema, LakeSettingsInput } from "../schemas/lake-settings.schema";
import { SettingsCard } from "./settings-card";
import { Building2, Save } from "lucide-react";

export function LakeInfoForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LakeSettingsInput>({
    resolver: zodResolver(lakeSettingsSchema),
    defaultValues: {
      name: "Hồ Câu Thiên Nhiên",
      address: "123 Đường Ven Hồ, Hà Nội",
      phone: "0912345678",
      receiptFooter: "Chúc quý khách có những giây phút thư giãn!",
    }
  });

  const onSubmit = (data: LakeSettingsInput) => {
    console.log("Saving lake info:", data);
  };

  return (
    <SettingsCard 
      title="Thông tin Hồ câu" 
      description="Quản lý thông tin thương hiệu và liên hệ."
      icon={Building2}
    >
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
          <button className="h-14 px-8 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Save size={20} />
            Lưu thay đổi
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}
