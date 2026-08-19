"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertOctagon, CreditCard, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionBlockerProps {
  children: React.ReactNode;
  isExpired: boolean;
  planName: string;
  expiryDate: string | null;
}

export function SubscriptionBlocker({
  children,
  isExpired,
  planName,
  expiryDate,
}: SubscriptionBlockerProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Không chặn nếu gói cước chưa hết hạn, hoặc người dùng đang ở trang settings để thanh toán
  const shouldBlock = isExpired && pathname !== "/dashboard/settings";

  if (!shouldBlock) {
    return <>{children}</>;
  }

  const formattedDate = expiryDate
    ? format(new Date(expiryDate), "dd/MM/yyyy")
    : "Chưa xác định";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4">
      <div className="w-full max-w-lg bg-card/40 border border-destructive/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
        
        {/* Warning Icon */}
        <div className="w-20 h-20 mx-auto rounded-[2rem] bg-destructive/10 text-destructive flex items-center justify-center shadow-lg shadow-destructive/10 animate-bounce">
          <AlertOctagon size={44} />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2">
            <ShieldAlert className="text-destructive animate-pulse" size={24} />
            Hết Hạn Gói Dịch Vụ!
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
            Hồ câu của bạn đang tạm thời bị khóa hoạt động
          </p>
        </div>

        {/* Detail Box */}
        <div className="bg-destructive/5 rounded-2xl border border-destructive/10 p-5 text-left space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground uppercase tracking-wider">Gói hiện tại:</span>
            <span className="text-white font-black uppercase">{planName}</span>
          </div>
          <div className="flex justify-between text-xs font-bold border-t border-destructive/10 pt-3">
            <span className="text-muted-foreground uppercase tracking-wider">Ngày hết hạn:</span>
            <span className="text-destructive font-black">{formattedDate}</span>
          </div>
        </div>

        {/* Explaining */}
        <p className="text-xs text-muted-foreground leading-relaxed font-bold">
          Để đảm bảo tính liên tục của dữ liệu và hệ thống quản lý ca câu, in hóa đơn, vui lòng tiến hành gia hạn gói dịch vụ SaaS ngay lập tức.
        </p>

        {/* Action Button */}
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="w-full h-14 bg-destructive hover:bg-destructive/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-destructive/25 active:scale-[0.98] transition-all"
        >
          <CreditCard size={18} />
          Đến trang thanh toán gia hạn
        </button>
      </div>
    </div>
  );
}
