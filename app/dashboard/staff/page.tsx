"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Edit2, 
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { getStaffMembers, updateStaffMember } from "@/actions/staff-actions";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User as PrismaUser } from "@prisma/client";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { redirect } from "next/navigation";

export default function StaffPage() {
  const { currentLakeId } = useUIStore();
  const { user, isLoading: isAuthLoading, isSuperAdmin, isOwner } = useAuthSession();
  const [staff, setStaff] = useState<PrismaUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isSuperAdmin && !isOwner) {
      redirect("/dashboard");
    }
  }, [isAuthLoading, isSuperAdmin, isOwner]);

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      const result = await getStaffMembers(currentLakeId || "");
      if (result.success) {
        setStaff(result.data || []);
      }
      setIsLoading(false);
    };
    fetchStaff();
  }, [currentLakeId]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await updateStaffMember(id, { isActive: !currentStatus });
    if (result.success) {
      setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      toast.success("Đã cập nhật trạng thái nhân viên");
    } else {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAuthLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Quản lý nhân viên</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Users size={14} />
            {staff.length} nhân viên trong hệ thống
          </p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <UserPlus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="w-full h-14 pl-12 pr-4 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="h-14 px-4 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center gap-2 hover:bg-white/5 transition-all">
            <Filter size={18} />
            <span className="text-sm font-bold">Lọc</span>
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[200px] glass-card rounded-[2.5rem] animate-pulse" />
          ))
        ) : (
          filteredStaff.map((member) => (
            <div key={member.id} className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute top-4 right-4 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-white/5 rounded-2xl p-2">
                    <DropdownMenuItem className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                      <Edit2 size={16} />
                      <span className="font-bold text-xs">Chỉnh sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleStatus(member.id, member.isActive)}
                      className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                    >
                      {member.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      <span className="font-bold text-xs">{member.isActive ? "Khóa tài khoản" : "Mở khóa"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-all">
                      <Trash2 size={16} />
                      <span className="font-bold text-xs">Xóa nhân viên</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-lg leading-none mb-2">{member.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      member.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {member.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail size={16} />
                  <span className="font-medium">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield size={16} />
                  <span className="font-bold text-primary uppercase tracking-widest text-[10px]">{member.role}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Đã thêm: {new Date(member.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <div className="flex -space-x-2">
                  {/* Placeholder for activity circles */}
                  <div className="w-6 h-6 rounded-full border-2 border-card bg-green-500" />
                  <div className="w-6 h-6 rounded-full border-2 border-card bg-blue-500" />
                </div>
              </div>
            </div>
          ))
        )}

        {!isLoading && filteredStaff.length === 0 && (
          <div className="col-span-full h-[400px] glass-card rounded-[3rem] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-black mb-2">Không tìm thấy nhân viên</h2>
            <p className="text-muted-foreground max-w-xs">
              Thử tìm kiếm với tên khác hoặc thêm nhân viên mới vào hệ thống.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px my-1", className)} />;
}
