"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { Users, UserPlus, Mail, Shield, Loader2, Phone, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { getStaffMembers, createStaffMember } from "@/actions/staff-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";

export function EmployeeSettings() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { currentLakeId } = useUIStore();

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const result = await getStaffMembers(currentLakeId || "");
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [currentLakeId]);

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const role = formData.get("role") as any;

      const result = await createStaffMember({
        name,
        email,
        role: role || "STAFF",
        // Pass phone if your action supports it, otherwise we'll update it separately or modify the action
      });

      if (result.success) {
        toast.success("Đã thêm nhân viên mới và gửi lời mời");
        setIsAdding(false);
        loadEmployees();
      } else {
        toast.error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thêm nhân viên");
    } finally {
      setIsSaving(false);
    }
  };

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
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black uppercase">
                  {emp.name?.charAt(0) || emp.email?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">{emp.name || "Chưa đặt tên"}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                      <Mail size={12} />
                      {emp.email || "N/A"}
                    </div>
                    {emp.phone && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                        <Phone size={12} />
                        {emp.phone}
                      </div>
                    )}
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

        <button 
          onClick={() => setIsAdding(true)}
          className="h-16 w-full bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <UserPlus size={20} />
          Thêm nhân viên mới
        </button>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Thêm nhân viên mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và tên</label>
                <input 
                  name="name"
                  required
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email (Dùng để đăng nhập)</label>
                <input 
                  name="email"
                  type="email"
                  required
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="nhanvien@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</label>
                <input 
                  name="phone"
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="0987654321"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vai trò</label>
                <select 
                  name="role"
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
                >
                  <option value="STAFF">Nhân viên (Staff)</option>
                  <option value="CASHIER">Thu ngân (Cashier)</option>
                  <option value="OWNER">Quản lý (Owner)</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  Xác nhận & Thêm
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsCard>
  );
}
