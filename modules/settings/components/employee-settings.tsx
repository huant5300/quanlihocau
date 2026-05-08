"use client";

import React from "react";
import { SettingsCard } from "./settings-card";
import { Users, UserPlus, Mail, Shield } from "lucide-react";

const MOCK_EMPLOYEES = [
  { id: "1", name: "Nguyễn Quản Lý", role: "Admin", email: "admin@hocau.com" },
  { id: "2", name: "Trần Nhân Viên", role: "Staff", email: "staff1@hocau.com" },
];

export function EmployeeSettings() {
  return (
    <SettingsCard 
      title="Nhân viên & Phân quyền" 
      description="Quản lý đội ngũ vận hành và quyền truy cập."
      icon={Users}
    >
      <div className="space-y-4">
        {MOCK_EMPLOYEES.map((emp) => (
          <div key={emp.id} className="p-6 bg-accent/30 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                {emp.name.charAt(0)}
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-tight">{emp.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    <Mail size={12} />
                    {emp.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Shield size={12} />
                    {emp.role}
                  </div>
                </div>
              </div>
            </div>
            
            <button className="h-10 px-4 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Sửa
            </button>
          </div>
        ))}

        <button className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <UserPlus size={20} />
          Thêm nhân viên mới
        </button>
      </div>
    </SettingsCard>
  );
}
