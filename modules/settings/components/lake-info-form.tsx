"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lakeSettingsSchema, LakeSettingsInput } from "../schemas/lake-settings.schema";
import { SettingsCard } from "./settings-card";
import { Building2, Save, Loader2, QrCode, AlertCircle } from "lucide-react";
import { settingsService } from "@/services/api/settings-service";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VIET_BANKS } from "@/utils/vietqr";

export function LakeInfoForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LakeSettingsInput>({
    resolver: zodResolver(lakeSettingsSchema),
  });

  const selectedBankName = watch("bankName");

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
        bankName: lakeInfo.bankName || "",
        bankAccount: lakeInfo.bankAccount || "",
        bankHolder: lakeInfo.bankHolder || "",
        bankBin: lakeInfo.bankBin || "",
      });
    }
  }, [lakeInfo, reset]);

  // When user selects a bank from dropdown, automatically map the BIN
  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankShortName = e.target.value;
    const foundBank = VIET_BANKS.find(b => b.shortName === bankShortName || b.name === bankShortName);
    if (foundBank) {
      setValue("bankName", foundBank.shortName);
      setValue("bankBin", foundBank.bin);
    } else {
      setValue("bankName", bankShortName);
      setValue("bankBin", "");
    }
  };

  const mutation = useMutation({
    mutationFn: (data: LakeSettingsInput) => 
      settingsService.updateLakeInfo({
        name: data.name,
        address: data.address,
        phone: data.phone,
        receipt_footer: data.receiptFooter,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankHolder: data.bankHolder,
        bankBin: data.bankBin,
      }),
    onSuccess: () => {
      toast.success("Đã cập nhật thông tin hồ câu thành công!");
      queryClient.invalidateQueries({ queryKey: ["lake-info"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật";
      toast.error(msg);
    }
  });

  const onSubmit = (data: LakeSettingsInput) => {
    mutation.mutate(data);
  };

  return (
    <SettingsCard 
      title="Thông tin Hồ câu & Tài khoản nhận tiền" 
      description="Quản lý thông tin hồ câu, chân trang hóa đơn và tài khoản VietQR để khách quét mã thanh toán."
      icon={Building2}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Notice for required fields */}
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 text-amber-500" />
          <span>
            Các mục đánh dấu <span className="text-rose-500 font-black text-sm">*</span> là bắt buộc (1 tài khoản / hồ sử dụng 1 số điện thoại duy nhất).
          </span>
        </div>

        {/* Lake Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Lake Name */}
          <div className="space-y-1.5">
            <label htmlFor="lake-name-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              Tên Hồ câu <span className="text-rose-500 font-black">*</span>
            </label>
            <input 
              id="lake-name-input"
              type="text"
              placeholder="VD: Hồ Câu Dịch Vụ Đồng Quê"
              {...register("name")}
              className={`w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none transition-all font-semibold ${
                errors.name ? "border-rose-500 focus:border-rose-600 ring-1 ring-rose-500/20" : "border-slate-200 dark:border-zinc-700 focus:border-emerald-500"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 font-bold ml-1">{errors.name.message}</p>}
          </div>

          {/* Lake Phone */}
          <div className="space-y-1.5">
            <label htmlFor="lake-phone-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              Số điện thoại liên hệ <span className="text-rose-500 font-black">*</span>
            </label>
            <input 
              id="lake-phone-input"
              type="tel"
              placeholder="VD: 0855550813 (10 chữ số)"
              {...register("phone")}
              className={`w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none transition-all font-semibold ${
                errors.phone ? "border-rose-500 focus:border-rose-600 ring-1 ring-rose-500/20" : "border-slate-200 dark:border-zinc-700 focus:border-emerald-500"
              }`}
            />
            {errors.phone && <p className="text-[11px] text-rose-500 font-bold ml-1">{errors.phone.message}</p>}
          </div>

          {/* Lake Address */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="lake-address-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              Địa chỉ hồ câu <span className="text-rose-500 font-black">*</span>
            </label>
            <input 
              id="lake-address-input"
              type="text"
              placeholder="VD: Số 123 Đường Câu Cá, Bình Dương"
              {...register("address")}
              className={`w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none transition-all font-semibold ${
                errors.address ? "border-rose-500 focus:border-rose-600 ring-1 ring-rose-500/20" : "border-slate-200 dark:border-zinc-700 focus:border-emerald-500"
              }`}
            />
            {errors.address && <p className="text-[11px] text-rose-500 font-bold ml-1">{errors.address.message}</p>}
          </div>

          {/* Receipt Footer */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="lake-receipt-footer-textarea" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Lời chào chân hóa đơn
            </label>
            <textarea 
              id="lake-receipt-footer-textarea"
              placeholder="VD: Chúc quý cần thủ giật được nhiều cá khủng! Hẹn gặp lại quý khách."
              {...register("receiptFooter")}
              className="w-full min-h-[80px] p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-emerald-500 font-semibold resize-none"
            />
          </div>
        </div>

        {/* Bank & VietQR Settings */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <QrCode size={16} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Tài khoản nhận tiền chuyển khoản (Mã VietQR)
              </h4>
              <p className="text-[11px] text-slate-400">
                Thông tin này sẽ tự động tạo mã QR trên màn hình thanh toán và trên hóa đơn in nhiệt cho khách quét tiền
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Bank Select Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="bank-name-select" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Ngân Hàng Nhận Tiền
              </label>
              <select
                id="bank-name-select"
                value={selectedBankName || ""}
                onChange={handleBankChange}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-emerald-500 font-semibold cursor-pointer"
              >
                <option value="">-- Chọn ngân hàng --</option>
                {VIET_BANKS.map((b) => (
                  <option key={b.bin} value={b.shortName}>
                    {b.shortName} - {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label htmlFor="bank-account" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Số Tài Khoản
              </label>
              <input 
                id="bank-account"
                type="text"
                placeholder="Nhập số tài khoản nhận tiền"
                {...register("bankAccount")}
                className="w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Account Holder Name */}
            <div className="space-y-1.5">
              <label htmlFor="bank-holder" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Tên Chủ Tài Khoản
              </label>
              <input 
                id="bank-holder"
                type="text"
                placeholder="VD: NGUYEN VAN A"
                {...register("bankHolder")}
                className="w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-emerald-500 font-semibold uppercase"
              />
            </div>

          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{mutation.isPending ? "Đang lưu..." : "Lưu cài đặt hồ câu"}</span>
          </button>
        </div>

      </form>
    </SettingsCard>
  );
}
