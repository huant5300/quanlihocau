"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { Users, UserPlus, Mail, Shield, Loader2 } from "lucide-react";
import { axiosApiClient } from "@/services/api/axios-client";

export function EmployeeSettings() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      setIsLoading(true);
      try {
        const response = await axiosApiClient.get<any[]>("/api/v1/users/");
        setEmployees(response.data || []);
      } catch (error) {
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployees();
  }, []);

  return (
    <SettingsCard 
      title="Nhân viên & Phân quyền" 
      description="Quản lý đội ngũ vận hành và quyền truy cập."
      icon={Users}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center bg-accent/20 rounded-[2.5rem] border border-dashed border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chưa có nhân viên nào ngoài bạn.</p>
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="p-6 bg-accent/30 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                  {emp.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">{emp.full_name || emp.username}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                      <Mail size={12} />
                      {emp.email || "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                      <Shield size={12} />
                      {emp.role || "STAFF"}
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="h-10 px-4 bg-accent/50 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Sửa
              </button>
            </div>
          ))
        )}

        <button className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <UserPlus size={20} />
          Thêm nhân viên mới
        </button>
      </div>
    </SettingsCard>
  );
}
