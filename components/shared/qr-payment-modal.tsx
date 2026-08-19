"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { generateVietQRUrl, VietQRParams } from "@/utils/vietqr";
import { Button } from "@/components/ui/button";

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  paymentDetails: VietQRParams;
}

export function QRPaymentModal({ isOpen, onClose, onConfirmPayment, paymentDetails }: QRPaymentModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && paymentDetails.bankBin) {
      setQrUrl(generateVietQRUrl(paymentDetails));
    }
  }, [isOpen, paymentDetails]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-black uppercase tracking-tight text-white flex items-center gap-2">
            Thanh Toán QR Code
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-8 flex flex-col items-center justify-center bg-white">
          {!paymentDetails.bankBin ? (
            <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-xl">
              Chưa cấu hình tài khoản ngân hàng nhận tiền. Vui lòng vào Cài đặt để thêm.
            </div>
          ) : (
            <>
              {qrUrl ? (
                <div className="p-2 border-2 border-primary/20 rounded-xl mb-4 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl mb-4 text-gray-500 font-bold">
                  Đang tạo mã QR...
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-800 text-center mb-1">
                {Number(paymentDetails.amount).toLocaleString()}đ
              </h2>
              <p className="text-sm font-bold text-slate-500 mb-6 text-center">
                Mở App ngân hàng để quét mã
              </p>
            </>
          )}
        </div>

        {/* Details & Actions */}
        <div className="p-6 bg-[#0f0f0f] space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl">
            <div className="text-muted-foreground">Ngân hàng:</div>
            <div className="font-bold text-right text-white break-words">{paymentDetails.bankBin}</div>
            
            <div className="text-muted-foreground">Số TK:</div>
            <div className="font-bold text-right text-white flex justify-end items-center gap-2">
              {paymentDetails.accountNo}
              <Copy size={14} className="cursor-pointer text-muted-foreground hover:text-white" onClick={() => handleCopy(paymentDetails.accountNo, 'Số tài khoản')} />
            </div>
            
            <div className="text-muted-foreground">Chủ tài khoản:</div>
            <div className="font-bold text-right text-white">{paymentDetails.accountName}</div>
            
            <div className="text-muted-foreground">Nội dung:</div>
            <div className="font-bold text-right text-primary flex justify-end items-center gap-2">
              {paymentDetails.description}
              <Copy size={14} className="cursor-pointer text-muted-foreground hover:text-white" onClick={() => handleCopy(paymentDetails.description, 'Nội dung CK')} />
            </div>
          </div>

          <Button 
            onClick={() => {
              onConfirmPayment();
              onClose();
            }}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl text-sm"
          >
            <CheckCircle2 size={18} className="mr-2" />
            Đã nhận được tiền
          </Button>
        </div>
      </div>
    </div>
  );
}
