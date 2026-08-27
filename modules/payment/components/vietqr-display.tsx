"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/api/settings-service";
import { Loader2, AlertTriangle, Download, Copy, Check } from "lucide-react";
import { removeVietnameseTones } from "@/services/printer/printer-service";

interface VietQRDisplayProps {
  amount: number;
  info: string;
}

export function VietQRDisplay({ amount, info }: VietQRDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const { data: lakeInfo, isLoading } = useQuery({
    queryKey: ["lake-info"],
    queryFn: () => settingsService.getLakeInfo(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl">
        <Loader2 className="animate-spin text-muted-foreground mb-2" size={24} />
        <p className="text-xs font-bold text-muted-foreground">Đang tải thông tin VietQR...</p>
      </div>
    );
  }

  const { bankBin, bankAccount, bankHolder } = lakeInfo || {};

  if (!bankBin || !bankAccount) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600">
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold">Chưa cấu hình Ngân hàng</p>
          <p className="text-xs mt-1">
            Vui lòng vào phần Cài đặt Hệ thống &gt; Cấu hình Hồ để thiết lập tài khoản nhận tiền bằng VietQR.
          </p>
        </div>
      </div>
    );
  }

  const cleanInfo = removeVietnameseTones(info).replace(/\s+/g, "");
  const qrUrl = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${cleanInfo}&accountName=${encodeURIComponent(bankHolder || "")}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl items-center">
      <div className="w-48 h-48 bg-white p-2 rounded-xl border border-border shadow-sm shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="VietQR" className="w-full h-full object-contain" />
      </div>
      
      <div className="flex-1 space-y-4 text-center md:text-left">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Chuyển khoản VietQR</h4>
          <p className="text-lg font-black text-foreground">{bankHolder}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-background border border-border rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Số tài khoản</span>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold">{bankAccount}</span>
              <button 
                onClick={copyToClipboard}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Sao chép STK"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          
          <div className="bg-background border border-border rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Ngân hàng</span>
            <span className="font-bold truncate" title={lakeInfo?.bankName}>{lakeInfo?.bankName || bankBin}</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-3 text-center md:text-left">
          <span className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5 block">Nội dung CK</span>
          <span className="font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{cleanInfo}</span>
        </div>
      </div>
    </div>
  );
}
