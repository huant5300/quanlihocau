"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  MoreVertical, 
  Edit2, 
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2,
  History,
  Phone,
  Key,
  X,
  Lock,
  Plus
} from "lucide-react";
import { 
  getStaffMembers, 
  createStaffMember, 
  updateStaffMember, 
  deleteStaffMember, 
  getStaffActivityLogs 
} from "@/actions/staff-actions";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User as PrismaUser, UserRole } from "@prisma/client";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { redirect } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StaffPage() {
  const { currentLakeId } = useUIStore();
  const { user: currentUser, isLoading: isAuthLoading, isSuperAdmin, isOwner } = useAuthSession();
  const [staff, setStaff] = useState<PrismaUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<PrismaUser | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isSuperAdmin && !isOwner) {
      redirect("/dashboard");
    }
  }, [isAuthLoading, isSuperAdmin, isOwner]);

  const fetchStaff = async () => {
    setIsLoading(true);
    const result = await getStaffMembers(currentLakeId || "");
    if (result.success) {
      setStaff(result.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [currentLakeId]);

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const username = formData.get("username") as string;
      const phone = formData.get("phone") as string;
      const password = formData.get("password") as string;
      const role = formData.get("role") as UserRole;

      if (!name || !username || !password) {
        toast.error("Vui lòng điền các trường bắt buộc");
        setIsSaving(false);
        return;
      }

      const res = await createStaffMember({
        name,
        username,
        phone: phone || undefined,
        password,
        role,
      });

      if (res.success) {
        toast.success("Tạo tài khoản nhân viên mới thành công");
        setIsAddOpen(false);
        fetchStaff();
      } else {
        toast.error(res.error || "Không thể tạo nhân viên");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const username = formData.get("username") as string;
      const phone = formData.get("phone") as string;
      const role = formData.get("role") as UserRole;

      if (!name || !username) {
        toast.error("Vui lòng điền các trường bắt buộc");
        setIsSaving(false);
        return;
      }

      const res = await updateStaffMember(selectedStaff.id, {
        name,
        username,
        phone,
        role,
      });

      if (res.success) {
        toast.success("Cập nhật thông tin nhân viên thành công");
        setIsEditOpen(false);
        fetchStaff();
      } else {
        toast.error(res.error || "Lỗi khi cập nhật");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get("password") as string;

      if (!password || password.length < 4) {
        toast.error("Mật khẩu mới phải từ 4 ký tự trở lên");
        setIsSaving(false);
        return;
      }

      const res = await updateStaffMember(selectedStaff.id, { password });

      if (res.success) {
        toast.success(`Đã đổi mật khẩu cho nhân viên ${selectedStaff.name}`);
        setIsPasswordOpen(false);
      } else {
        toast.error(res.error || "Không thể đổi mật khẩu");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await updateStaffMember(id, { isActive: !currentStatus });
    if (result.success) {
      setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      toast.success(currentStatus ? "Đã khóa tài khoản nhân viên" : "Đã mở khóa tài khoản nhân viên");
    } else {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA nhân viên "${name}" khỏi hệ thống? Hành động này không thể hoàn tác.`)) return;
    
    try {
      const res = await deleteStaffMember(id);
      if (res.success) {
        toast.success("Đã xóa nhân viên thành công");
        fetchStaff();
      } else {
        toast.error(res.error || "Không thể xóa nhân viên");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Chủ Hồ (Owner)";
      case "MANAGER":
        return "Quản Lý (Manager)";
      case "STAFF":
        return "Nhân Viên (Staff)";
      case "CASHIER":
        return "Thu Ngân (Cashier)";
      default:
        return role;
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Quản lý nhân viên</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Users size={14} />
            {staff.length} nhân viên trong hệ thống
          </p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-white h-14 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 text-xs uppercase tracking-wider"
        >
          <UserPlus size={18} />
          Thêm nhân viên
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo họ tên hoặc tên đăng nhập (username)..."
            className="w-full h-14 pl-12 pr-4 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsEditOpen(true);
                      }}
                      className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Edit2 size={16} />
                      <span className="font-bold text-xs">Chỉnh sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsPasswordOpen(true);
                      }}
                      className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-yellow-500/10 hover:text-yellow-500 transition-all"
                    >
                      <Key size={16} />
                      <span className="font-bold text-xs">Đổi mật khẩu</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsLogsOpen(true);
                      }}
                      className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                    >
                      <History size={16} />
                      <span className="font-bold text-xs">Hoạt động</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleStatus(member.id, member.isActive)}
                      className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                    >
                      {member.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      <span className="font-bold text-xs">{member.isActive ? "Khóa tài khoản" : "Mở khóa"}</span>
                    </DropdownMenuItem>
                    <div className="h-px bg-white/5 my-1" />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteStaff(member.id, member.name || "")}
                      className="rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 size={16} />
                      <span className="font-bold text-xs">Xóa nhân viên</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-primary font-black text-xl shadow-inner uppercase">
                  {member.name?.charAt(0) || member.username?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-black text-lg leading-none mb-2">{member.name || "Chưa đặt tên"}</h3>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      member.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {member.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  <Lock size={16} className="text-primary/75" />
                  <span>Tên đăng nhập: </span>
                  <span className="text-foreground font-black normal-case tracking-normal">{member.username || "N/A"}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold">
                    <Phone size={16} className="text-primary/75" />
                    <span>SĐT: </span>
                    <span className="text-foreground font-black">{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  <Shield size={16} className="text-primary/75" />
                  <span>Quyền: </span>
                  <span className="text-primary font-black tracking-widest text-[9px]">{member.role}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Đã thêm: {new Date(member.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Vai trò:</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{getRoleLabel(member.role)}</span>
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
            <h2 className="text-xl font-black mb-2 uppercase tracking-tight">Không tìm thấy nhân viên</h2>
            <p className="text-muted-foreground max-w-xs text-xs">
              Thử tìm kiếm với tên khác hoặc thêm nhân viên mới vào hệ thống.
            </p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Thêm nhân viên mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStaff} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên *</label>
              <input 
                name="name"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên đăng nhập * (Username)</label>
              <input 
                name="username"
                required
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                placeholder="e.g. nhanvien1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu khởi tạo *</label>
              <input 
                name="password"
                type="password"
                required
                defaultValue="123456"
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại</label>
              <input 
                name="phone"
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                placeholder="0987654321"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quyền hạn *</label>
              <select 
                name="role"
                required
                defaultValue="STAFF"
                className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
              >
                <option value="STAFF">Nhân Viên Ca (Staff)</option>
                <option value="MANAGER">Quản Lý (Manager)</option>
                <option value="OWNER">Chủ Hồ (Owner)</option>
              </select>
            </div>

            <DialogFooter className="pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Tạo tài khoản
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Chỉnh sửa nhân viên</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleUpdateStaff} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên *</label>
                <input 
                  name="name"
                  required
                  defaultValue={selectedStaff.name || ""}
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên đăng nhập * (Username)</label>
                <input 
                  name="username"
                  required
                  defaultValue={selectedStaff.username || ""}
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại</label>
                <input 
                  name="phone"
                  defaultValue={selectedStaff.phone || ""}
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quyền hạn *</label>
                <select 
                  name="role"
                  required
                  defaultValue={selectedStaff.role}
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold appearance-none"
                >
                  <option value="STAFF">Nhân Viên Ca (Staff)</option>
                  <option value="MANAGER">Quản Lý (Manager)</option>
                  <option value="OWNER">Chủ Hồ (Owner)</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Lưu thay đổi
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Key className="text-primary" />
              Đặt lại mật khẩu
            </DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
              <div className="bg-accent/20 p-4 rounded-2xl border border-white/5 mb-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đang thao tác trên tài khoản:</p>
                <p className="text-sm font-black text-white mt-1">{selectedStaff.name} ({selectedStaff.username})</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu mới *</label>
                <input 
                  name="password"
                  type="password"
                  required
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <DialogFooter className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Cập nhật mật khẩu
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Logs Modal */}
      <StaffActivityModal 
        isOpen={isLogsOpen}
        onClose={() => {
          setIsLogsOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
      />
    </div>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px my-1 bg-white/5", className)} />;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  createdAt: string;
}

interface StaffActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: PrismaUser | null;
}

function StaffActivityModal({ isOpen, onClose, staff }: StaffActivityModalProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && staff) {
      const fetchLogs = async () => {
        setIsLoading(true);
        try {
          const res = await getStaffActivityLogs(staff.id);
          if (res.success && res.data) {
            setLogs(res.data as any[]);
          } else {
            toast.error(res.error || "Không thể lấy lịch sử hoạt động");
          }
        } catch (e) {
          toast.error("Lỗi khi tải lịch sử hoạt động");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [isOpen, staff]);

  const getActionLabel = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "Đăng nhập";
      case "START_SESSION":
        return "Bắt đầu ca câu";
      case "COMPLETE_SESSION":
        return "Hoàn thành ca câu";
      case "POS_CHECKOUT":
        return "Bán hàng POS";
      case "CREATE_STAFF":
        return "Thêm nhân viên";
      case "UPDATE_STAFF":
        return "Cập nhật nhân viên";
      case "DELETE_STAFF":
        return "Xóa nhân viên";
      case "SHIFT_START":
        return "Mở ca trực";
      case "SHIFT_CLOSE":
        return "Chốt ca trực";
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "START_SESSION":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "COMPLETE_SESSION":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "POS_CHECKOUT":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "CREATE_STAFF":
        return "text-pink-500 bg-pink-500/10 border-pink-500/20";
      case "SHIFT_START":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "SHIFT_CLOSE":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const renderDetails = (log: ActivityLog) => {
    if (!log.details) return null;
    const d = log.details;
    switch (log.action) {
      case "LOGIN":
        return <span className="text-muted-foreground">Nhà cung cấp: {d.provider}</span>;
      case "START_SESSION":
        return <span className="text-muted-foreground">Ô câu: <span className="text-primary font-bold">{d.areaName}</span> ({d.packageId})</span>;
      case "COMPLETE_SESSION":
        return <span className="text-muted-foreground">Mã lượt câu: <span className="text-foreground font-bold">{d.sessionId?.substring(0,8)}</span></span>;
      case "POS_CHECKOUT":
        return (
          <span className="text-muted-foreground">
            Hóa đơn: <span className="text-foreground font-bold">{d.invoiceNumber}</span> - Tổng tiền: <span className="text-orange-500 font-bold">{Number(d.totalAmount).toLocaleString()}đ</span>
          </span>
        );
      case "CREATE_STAFF":
        return <span className="text-muted-foreground">Nhân viên: <span className="text-foreground font-bold">{d.staffName}</span> - Username: <span className="text-foreground font-bold">{d.username}</span></span>;
      case "UPDATE_STAFF":
        return <span className="text-muted-foreground">Mã ID: <span className="text-foreground font-bold">{d.staffId?.substring(0,8)}</span> - Cập nhật: <span className="text-foreground font-bold">{d.updates?.join(", ")}</span></span>;
      case "SHIFT_START":
        return <span className="text-muted-foreground">Mở ca làm việc ID: <span className="text-foreground font-bold">{d.shiftId?.substring(0,8)}</span></span>;
      case "SHIFT_CLOSE":
        return (
          <span className="text-muted-foreground">
            Chốt ca ID: <span className="text-foreground font-bold">{d.shiftId?.substring(0,8)}</span> - Kỳ vọng: <span className="text-emerald-500 font-bold">{Number(d.expectedCash).toLocaleString()}đ</span> - Thực tế: <span className="text-emerald-500 font-bold">{Number(d.actualCash).toLocaleString()}đ</span> - Chênh lệch: <span className="text-rose-500 font-bold">{Number(d.discrepancy).toLocaleString()}đ</span>
          </span>
        );
      default:
        return <pre className="text-[10px] text-zinc-500 max-w-full overflow-x-auto">{JSON.stringify(d)}</pre>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-[2.5rem] bg-zinc-950 border-white/10 text-white">
        <DialogHeader className="p-4 border-b border-white/5">
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <History className="text-primary" />
            Lịch sử hoạt động: {staff?.name || "Nhân viên"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-medium italic text-xs uppercase tracking-wider">
              Chưa ghi nhận hoạt động nào của nhân viên này.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-primary/20 ml-3 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  
                  <div className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl space-y-1.5 transition-all">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                        getActionColor(log.action)
                      )}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold italic">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-300">
                      {renderDetails(log)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
