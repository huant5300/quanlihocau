"use client";

import React from "react";
import { SettingsCard } from "./settings-card";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export function EmployeeSettings() {
  return (
    <SettingsCard 
      title="Nhân viên & Phân quyền" 
      description="Quản lý đội ngũ vận hành, tên đăng nhập, phân quyền vai trò và khóa/mở khóa tài khoản nhân viên."
      icon={Users}
    >
      <div className="p-8 bg-accent/20 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <Users size={28} />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-sm uppercase tracking-tight text-white">Quản lý Tài khoản Tập trung</h4>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            Để thêm nhân viên mới, cấp tên đăng nhập (username), đổi mật khẩu, hoặc chốt ca trực của thu ngân, vui lòng truy cập trang quản lý nhân viên chuyên dụng.
          </p>
        </div>
        
        <Link 
          href="/dashboard/staff"
          className="h-12 px-6 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
        >
          <span>Đi tới trang Nhân viên</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </SettingsCard>
  );
}
