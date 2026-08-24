"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  User,
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  Loader2, 
  X, 
  TrendingUp, 
  Activity, 
  Clock, 
  DollarSign, 
  Building2,
  ChevronRight,
  Fish,
  Grid,
  ScrollText,
  Ticket,
  ShoppingBag,
  CreditCard,
  FileText,
  CheckCircle2
} from "lucide-react";
import { getLakeOwners } from "@/actions/lake-actions";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  getAllPendingOrders, 
  approveSubscriptionOrder, 
  rejectSubscriptionOrder, 
  updateLakeSubscriptionDirect 
} from "@/actions/subscription-actions";

const actionLabels: Record<string, { label: string; icon: any; color: string }> = {
  START_SESSION: { label: "Tạo vé câu", icon: Ticket, color: "text-emerald-500 bg-emerald-500/10" },
  COMPLETE_SESSION: { label: "Hoàn tất phiên", icon: Ticket, color: "text-blue-500 bg-blue-500/10" },
  CANCEL_SESSION: { label: "Hủy phiên", icon: Ticket, color: "text-red-500 bg-red-500/10" },
  EXTEND_SESSION: { label: "Gia hạn giờ", icon: Clock, color: "text-purple-500 bg-purple-500/10" },
  ADD_PRODUCT: { label: "Thêm sản phẩm", icon: ShoppingBag, color: "text-orange-500 bg-orange-500/10" },
  FISH_BUYBACK: { label: "Thu cá", icon: Fish, color: "text-cyan-500 bg-cyan-500/10" },
  FISH_STOCK_ADD: { label: "Nhập cá", icon: Fish, color: "text-emerald-500 bg-emerald-500/10" },
  FISH_STOCK_DEAD: { label: "Cá chết", icon: Fish, color: "text-red-500 bg-red-500/10" },
  FISH_STOCK_ADD_MORE: { label: "Thả thêm cá", icon: Fish, color: "text-green-500 bg-green-500/10" },
  CHECKOUT: { label: "Thanh toán", icon: CreditCard, color: "text-green-500 bg-green-500/10" },
  PAYMENT: { label: "Thu tiền", icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10" },
  REFUND: { label: "Hoàn tiền", icon: CreditCard, color: "text-red-500 bg-red-500/10" },
  CREATE_CUSTOMER: { label: "Tạo khách", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  UPDATE_CUSTOMER: { label: "Sửa khách", icon: Users, color: "text-amber-500 bg-amber-500/10" },
  DELETE_CUSTOMER: { label: "Xóa khách", icon: Users, color: "text-red-500 bg-red-500/10" },
  SHIFT_CLOSE: { label: "Kết ca", icon: FileText, color: "text-violet-500 bg-violet-500/10" },
  SHIFT_CLOSE_FLAGGED: { label: "Kết ca - Lệch", icon: FileText, color: "text-red-500 bg-red-500/10" },
  LOGIN: { label: "Đăng nhập", icon: User, color: "text-blue-400 bg-blue-500/10" },
  UPDATE_LAKE: { label: "Thiết lập hồ", icon: Building2, color: "text-amber-500 bg-amber-500/10" },
};

interface LakeOwner {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  appUsageTime: number;
  lakes: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    totalSpots: number;
    activeSessionsCount: number;
    totalSessionsCount: number;
    totalRevenue: number;
    recentSessions: {
      id: string;
      customerName: string;
      areaName: string;
      startTime: string;
      endTime: string | null;
      status: string;
      amount: number;
    }[];
    recentTransactions: {
      id: string;
      amount: number;
      type: string;
      category: string | null;
      description: string;
      createdAt: string;
    }[];
    recentActivityLogs: {
      id: string;
      action: string;
      details: any;
      createdAt: string;
      userName: string;
      userEmail: string;
    }[];
  }[];
}

function formatUsageTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "Chưa có tương tác";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return `${seconds} giây`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 1) return `${minutes} phút`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days < 1) {
    return `${hours} giờ ${remainingMinutes} phút`;
  }
  return `${days} ngày ${remainingHours} giờ`;
}

export default function OwnersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isSuperAdmin } = useAuthSession();
  const [owners, setOwners] = useState<LakeOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all");
  const [selectedOwner, setSelectedOwner] = useState<LakeOwner | null>(null);
  
  // SaaS Subscription tab & states
  const [activeTab, setActiveTab] = useState<"owners" | "orders">("owners");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getAllPendingOrders();
      if (res.success && res.data) {
        setPendingOrders(res.data);
      } else {
        toast.error(res.error || "Không thể tải danh sách đơn hàng");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrders();
    }
  }, [isSuperAdmin]);

  const handleApproveOrder = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn phê duyệt đơn hàng này? Gói cước của hồ câu sẽ được gia hạn lập tức.")) return;
    try {
      const res = await approveSubscriptionOrder(id);
      if (res.success) {
        toast.success("Phê duyệt đơn hàng thành công!");
        fetchOrders();
        // Reload owners list
        const result = await getLakeOwners();
        if (result.success && result.data) {
          setOwners(result.data as LakeOwner[]);
        }
      } else {
        toast.error(res.error || "Phê duyệt thất bại");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    }
  };

  const handleRejectOrder = async (id: string) => {
    const reason = prompt("Nhập lý do từ chối đơn hàng (hoặc để trống):");
    if (reason === null) return;
    
    try {
      const res = await rejectSubscriptionOrder(id, reason);
      if (res.success) {
        toast.success("Đã từ chối đơn hàng!");
        fetchOrders();
      } else {
        toast.error(res.error || "Thao tác thất bại");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthLoading, isSuperAdmin, router]);

  useEffect(() => {
    const fetchOwners = async () => {
      setIsLoading(true);
      try {
        const result = await getLakeOwners();
        if (result.success && result.data) {
          setOwners(result.data as LakeOwner[]);
        } else {
          toast.error(result.error || "Không thể tải danh sách chủ hồ");
        }
      } catch (err) {
        console.error(err);
        toast.error("Đã xảy ra lỗi khi kết nối hệ thống");
      } finally {
        setIsLoading(false);
      }
    };
    if (isSuperAdmin) {
      fetchOwners();
    }
  }, [isSuperAdmin]);

  const filteredOwners = owners.filter(o => {
    const matchesSearch = 
      o.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && o.isActive) ||
      (statusFilter === "locked" && !o.isActive);

    return matchesSearch && matchesStatus;
  });

  if (isAuthLoading) {
    return (
      <div className="h-full min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Quản lý chủ hồ & SaaS</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Users size={14} />
            Hệ thống quản lý chủ hồ và duyệt thanh toán gói cước
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("owners")}
          className={cn(
            "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
            activeTab === "owners" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
          )}
        >
          Danh sách Chủ Hồ
        </button>
        <button
          onClick={() => {
            setActiveTab("orders");
            fetchOrders();
          }}
          className={cn(
            "h-12 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
            activeTab === "orders" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
          )}
        >
          Yêu cầu nâng cấp
          {pendingOrders.length > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-2 py-0.5 animate-pulse">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "owners" ? (
        <>
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm chủ hồ theo tên, email hoặc SĐT..."
                className="w-full h-14 pl-12 pr-4 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl p-1 flex gap-1 w-full md:w-auto">
                <button 
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    statusFilter === "all" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  )}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setStatusFilter("active")}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    statusFilter === "active" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  )}
                >
                  Hoạt động
                </button>
                <button 
                  onClick={() => setStatusFilter("locked")}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    statusFilter === "locked" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  )}
                >
                  Đã khóa
                </button>
              </div>
            </div>
          </div>

      {/* Grid Danh sách Chủ Hồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[220px] glass-card rounded-[2.5rem] animate-pulse" />
          ))
        ) : (
          filteredOwners.map((owner, idx) => (
            <motion.div 
              key={owner.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedOwner(owner)}
              className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/40 hover:scale-[1.02] cursor-pointer transition-all duration-300"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {owner.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-lg leading-tight mb-2 truncate group-hover:text-primary transition-colors">{owner.name || "Chưa đặt tên"}</h3>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                      owner.isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                      {owner.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Mail size={14} className="text-primary/70" />
                  <span className="font-bold truncate">{owner.email}</span>
                </div>
                {!owner.phone ? (
                  <div className="flex items-center gap-3 text-xs text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl w-fit">
                    <Phone size={14} className="animate-pulse" />
                    <span>⚠️ Thiếu SĐT liên lạc</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Phone size={14} className="text-primary/70" />
                    <span className="font-bold">{owner.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Clock size={14} className="text-primary/70" />
                  <span className="font-bold">
                    Sử dụng app: <span className="text-white bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg text-[10px]">{formatUsageTime(owner.appUsageTime)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Building2 size={14} className="text-primary/70" />
                  <span className="font-bold text-white bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg text-[10px]">
                    {owner.lakes.length} Hồ đang quản lý
                  </span>
                </div>
                {owner.lakes.length > 0 && (
                  <div className="flex flex-col pl-6 pt-1 text-[10px] sm:text-[11px] border-l-2 border-primary/20 ml-1.5 space-y-1">
                    {owner.lakes.map((lake) => (
                      <div key={lake.id} className="flex justify-between items-center gap-2">
                        <span className="font-bold text-slate-350 truncate max-w-[130px]">{lake.name}</span>
                        <span className="font-black text-primary tracking-wider shrink-0">{lake.phone || "Chưa có SĐT"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-muted-foreground">
                <p className="text-[10px] font-bold italic">
                  Tham gia: {isMounted ? format(new Date(owner.createdAt), "dd/MM/yyyy") : ""}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                  Chi tiết <ChevronRight size={12} />
                </div>
              </div>
            </motion.div>
          ))
        )}

        {!isLoading && filteredOwners.length === 0 && (
          <div className="col-span-full h-[400px] glass-card rounded-[3rem] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-black mb-2">Không tìm thấy chủ hồ câu</h2>
            <p className="text-muted-foreground max-w-xs text-sm font-medium">
              Thử tìm kiếm với từ khóa khác hoặc lọc theo trạng thái tài khoản.
            </p>
          </div>
        )}
      </div>
      </>
      ) : (
        /* Tab Duyệt Đơn hàng */
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Yêu cầu nâng cấp chờ xử lý</h2>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                Đối soát tiền và duyệt gói cước thuê bao cho các chủ hồ câu
              </p>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar pt-2">
            {ordersLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-semibold uppercase text-[10px] tracking-widest bg-accent/5 rounded-2xl border border-dashed border-white/5">
                Chưa có yêu cầu nâng cấp gói cước nào đang chờ duyệt
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-bold">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="pb-4 pl-4">Chủ hồ / Liên hệ</th>
                    <th className="pb-4">Hồ câu</th>
                    <th className="pb-4">Gói đăng ký</th>
                    <th className="pb-4 text-center">Thời gian</th>
                    <th className="pb-4 text-right">Số tiền</th>
                    <th className="pb-4">Nội dung đối soát</th>
                    <th className="pb-4 text-center pr-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((o) => (
                    <tr key={o.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-all font-semibold">
                      <td className="py-4 pl-4">
                        <p className="font-black text-white">{o.ownerName}</p>
                        <p className="text-[10px] text-muted-foreground">{o.ownerEmail} | {o.ownerPhone}</p>
                      </td>
                      <td className="py-4 font-bold text-white">
                        {o.lakeName}
                      </td>
                      <td className="py-4 text-primary font-black uppercase">
                        {o.plan}
                      </td>
                      <td className="py-4 text-center">
                        {o.durationMonths} tháng
                      </td>
                      <td className="py-4 text-right font-black text-emerald-500">
                        {o.amount.toLocaleString()}đ
                      </td>
                      <td className="py-4">
                        <span className="bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl font-mono font-black text-xs text-white">
                          FISHING_SAAS_SUB_{o.id}
                        </span>
                      </td>
                      <td className="py-4 text-center pr-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRejectOrder(o.id)}
                            className="px-3.5 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApproveOrder(o.id)}
                            className="px-3.5 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/15"
                          >
                            Phê duyệt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
 
      {/* Owner Detail Modal (Popup) */}
      <AnimatePresence>
        {selectedOwner && (
          <OwnerDetailModal 
            owner={selectedOwner} 
            onClose={() => setSelectedOwner(null)} 
            onRefreshOwners={async () => {
              const result = await getLakeOwners();
              if (result.success && result.data) {
                setOwners(result.data as LakeOwner[]);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface OwnerDetailModalProps {
  owner: LakeOwner;
  onClose: () => void;
  onRefreshOwners: () => void;
}

function OwnerDetailModal({ owner, onClose, onRefreshOwners }: OwnerDetailModalProps) {
  const [activeLakeTab, setActiveLakeTab] = useState<string>(
    owner.lakes.length > 0 ? owner.lakes[0].id : ""
  );

  const selectedLake = owner.lakes.find(l => l.id === activeLakeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c0c0e]/95 border border-white/10 rounded-[3rem] shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Header Profile Section */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent border-b border-white/5 relative">
          <button 
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            title="Đóng cửa sổ"
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-primary/25 border border-white/15">
              {owner.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-white">{owner.name || "Chưa đặt tên"}</h2>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                  owner.isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {owner.isActive ? "Đang hoạt động" : "Đã khóa"}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  CHỦ HỒ
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-x-6 gap-y-1.5 text-xs text-muted-foreground font-bold">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-primary" /> {owner.email}
                </span>
                {owner.phone ? (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" /> {owner.phone}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-500 animate-pulse">
                    <Phone size={13} /> ⚠️ Thiếu SĐT liên lạc
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-primary" /> Thời gian sử dụng: {formatUsageTime(owner.appUsageTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" /> Tham gia: {format(new Date(owner.createdAt), "dd MMMM yyyy", { locale: vi })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-h-0 custom-scrollbar">
          {owner.lakes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground italic text-sm">
              Chủ hồ này chưa khởi tạo hồ câu nào trên hệ thống.
            </div>
          ) : (
            <>
              {/* Lake Tab Selectors */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-thin">
                {owner.lakes.map((lake) => (
                  <button
                    key={lake.id}
                    onClick={() => setActiveLakeTab(lake.id)}
                    className={cn(
                      "px-5 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-black uppercase tracking-wider transition-all border shrink-0",
                      activeLakeTab === lake.id
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Building2 size={14} />
                    {lake.name}
                  </button>
                ))}
              </div>

              {selectedLake && (
                <div className="space-y-8">
                  {/* SaaS Subscription Editor for Admin */}
                  <SubscriptionEditor 
                    lake={selectedLake} 
                    onUpdate={() => {
                      onRefreshOwners();
                      toast.success("Hệ thống đang đồng bộ lại giao diện...");
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    }} 
                  />

                  {/* Lake Address & Phone */}
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col md:flex-row gap-y-4 md:items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                        <MapPin size={14} className="text-primary" />
                        Địa chỉ hồ
                      </div>
                      <p className="text-sm font-bold text-white pl-6">
                        {selectedLake.address || "Chưa cấu hình địa chỉ hồ"}
                      </p>
                    </div>

                    <div className="h-px md:h-10 w-full md:w-px bg-white/5 self-stretch" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                        <Phone size={14} className="text-primary" />
                        Số điện thoại hồ
                      </div>
                      <p className="text-sm font-bold text-white pl-6">
                        {selectedLake.phone || "Chưa cấu hình số điện thoại hồ"}
                      </p>
                    </div>

                    <div className="h-px md:h-10 w-full md:w-px bg-white/5 self-stretch" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                        <Fish size={14} className="text-primary" />
                        Tổng số chòi/ô câu
                      </div>
                      <p className="text-sm font-black text-white pl-6">
                        {selectedLake.totalSpots} ô câu
                      </p>
                    </div>
                  </div>

                  {/* Lake Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Revenue */}
                    <div className="p-5 rounded-3xl bg-green-500/5 border border-green-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-green-500/5 -mr-4 -mt-4" />
                      <div className="relative z-10 space-y-1">
                        <div className="text-green-500 mb-2">
                          <DollarSign size={20} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Doanh thu tích lũy</p>
                        <h4 className="text-xl font-black text-green-500">{selectedLake.totalRevenue.toLocaleString()}đ</h4>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-blue-500/5 -mr-4 -mt-4" />
                      <div className="relative z-10 space-y-1">
                        <div className="text-blue-500 mb-2 flex items-center justify-between">
                          <Activity size={20} />
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Lượt câu hoạt động</p>
                        <h4 className="text-xl font-black text-blue-500">{selectedLake.activeSessionsCount} ca</h4>
                      </div>
                    </div>

                    {/* Total Sessions */}
                    <div className="p-5 rounded-3xl bg-purple-500/5 border border-purple-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-purple-500/5 -mr-4 -mt-4" />
                      <div className="relative z-10 space-y-1">
                        <div className="text-purple-500 mb-2">
                          <Fish size={20} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tổng số lượt câu</p>
                        <h4 className="text-xl font-black text-purple-500">{selectedLake.totalSessionsCount} ca</h4>
                      </div>
                    </div>

                    {/* Fill Rate */}
                    <div className="p-5 rounded-3xl bg-orange-500/5 border border-orange-500/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-orange-500/5 -mr-4 -mt-4" />
                      <div className="relative z-10 space-y-1">
                        <div className="text-orange-500 mb-2">
                          <TrendingUp size={20} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hiệu suất lấp đầy</p>
                        <h4 className="text-xl font-black text-orange-500">
                          {selectedLake.totalSpots > 0
                            ? Math.round((selectedLake.activeSessionsCount / selectedLake.totalSpots) * 100)
                            : 0}%
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Recent Sessions (Full width) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      Lịch sử ca câu gần đây
                    </h3>

                    <div className="bg-card/20 border border-white/5 rounded-3xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-muted-foreground bg-white/[0.02] font-black uppercase tracking-widest text-[9px]">
                              <th className="p-4">Khách hàng</th>
                              <th className="p-4">Ô câu</th>
                              <th className="p-4">Thời gian mở</th>
                              <th className="p-4">Trạng thái</th>
                              <th className="p-4 text-right">Tạm tính</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-medium">
                            {selectedLake.recentSessions.length > 0 ? (
                              selectedLake.recentSessions.map((session) => (
                                <tr key={session.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="p-4 font-bold text-white">{session.customerName}</td>
                                  <td className="p-4">
                                    <span className="bg-primary/10 text-primary border border-primary/15 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                                      {session.areaName}
                                    </span>
                                  </td>
                                  <td className="p-4 text-muted-foreground">
                                    {format(new Date(session.startTime), "HH:mm - dd/MM")}
                                  </td>
                                  <td className="p-4">
                                    <span className={cn(
                                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                      session.status === "ACTIVE" 
                                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                                        : session.status === "COMPLETED"
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                      {session.status === "ACTIVE" 
                                        ? "Đang câu" 
                                        : session.status === "COMPLETED" 
                                        ? "Hoàn thành" 
                                        : session.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right text-white font-black">
                                    {session.amount.toLocaleString()}đ
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground italic text-xs">
                                  Chưa ghi nhận ca câu nào ở hồ này.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Grid: Activity Log (8 cols) & Recent Transactions (4 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Activity Logs */}
                    <div className="lg:col-span-8 space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <ScrollText size={16} className="text-primary" />
                        Nhật ký hoạt động (Mới nhất)
                      </h3>

                      <div className="bg-card/20 border border-white/5 rounded-3xl overflow-hidden max-h-[350px] overflow-y-auto custom-scrollbar">
                        {selectedLake.recentActivityLogs && selectedLake.recentActivityLogs.length > 0 ? (
                          <div className="divide-y divide-white/5">
                            {selectedLake.recentActivityLogs.map((log: any) => {
                              const actionInfo = actionLabels[log.action] || {
                                label: log.action,
                                icon: ScrollText,
                                color: "text-slate-400 bg-slate-500/10"
                              };
                              const IconComp = actionInfo.icon;
                              const colorParts = actionInfo.color.split(" ");

                              return (
                                <div key={log.id} className="flex items-center gap-3.5 p-4 hover:bg-white/[0.01] transition-colors text-xs">
                                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", colorParts[1])}>
                                    <IconComp size={16} className={colorParts[0]} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={cn("font-black uppercase tracking-wider text-[10px]", colorParts[0])}>
                                        {actionInfo.label}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        bởi {log.userName}
                                      </span>
                                    </div>
                                    {log.details && (
                                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[400px]">
                                        {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                                      </p>
                                    )}
                                  </div>

                                  <div className="text-right shrink-0 font-bold text-muted-foreground text-[10px]">
                                    <p>{format(new Date(log.createdAt), "HH:mm")}</p>
                                    <p className="text-[8px] text-slate-500">{format(new Date(log.createdAt), "dd/MM/yyyy")}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground italic text-xs">
                            Chưa ghi nhận hoạt động nào của chủ hồ.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="lg:col-span-4 space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        Giao dịch phát sinh
                      </h3>

                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedLake.recentTransactions.length > 0 ? (
                          selectedLake.recentTransactions.map((tx) => (
                            <div 
                              key={tx.id} 
                              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 text-xs transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{tx.description}</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                  {format(new Date(tx.createdAt), "HH:mm - dd/MM")}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={cn(
                                  "font-black text-xs",
                                  tx.type === "INCOME" ? "text-green-500" : "text-red-500"
                                )}>
                                  {tx.type === "INCOME" ? "+" : "-"}
                                  {tx.amount.toLocaleString()}đ
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-muted-foreground border border-white/5 border-dashed rounded-2xl italic text-xs">
                            Chưa có giao dịch phát sinh.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function SubscriptionEditor({ lake, onUpdate }: { lake: any; onUpdate: () => void }) {
  const [plan, setPlan] = useState(lake.subscriptionPlan || "FREE");
  const [status, setStatus] = useState(lake.subscriptionStatus || "ACTIVE");
  const [expiresAt, setExpiresAt] = useState<string>(
    lake.subscriptionExpiresAt ? lake.subscriptionExpiresAt.substring(0, 10) : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await updateLakeSubscriptionDirect({
        lakeId: lake.id,
        plan,
        status,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      if (res.success) {
        toast.success("Cập nhật gói cước thành công!");
        onUpdate();
      } else {
        toast.error(res.error || "Cập nhật thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDays = (days: number) => {
    const base = expiresAt ? new Date(expiresAt) : new Date();
    base.setDate(base.getDate() + days);
    setExpiresAt(base.toISOString().substring(0, 10));
  };

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
      <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
        <CreditCard size={14} />
        Cấu hình Gói cước SaaS (Admin direct control)
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-bold text-xs">
        {/* Chọn gói */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Gói dịch vụ</label>
          <select 
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full h-11 px-3 bg-slate-900 border border-white/10 rounded-xl text-white font-bold text-xs outline-none"
          >
            <option value="FREE">FREE / TRIAL</option>
            <option value="BASIC">BASIC</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Trạng thái</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-11 px-3 bg-slate-900 border border-white/10 rounded-xl text-white font-bold text-xs outline-none"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="TRIAL">TRIAL</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Hạn dùng */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Ngày hết hạn</label>
          <input 
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full h-11 px-3 bg-slate-900 border border-white/10 rounded-xl text-white font-bold text-xs outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">Cộng nhanh:</span>
          <button 
            type="button"
            onClick={() => handleAddDays(30)}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] rounded-lg transition-all"
          >
            +30 ngày
          </button>
          <button 
            type="button"
            onClick={() => handleAddDays(90)}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] rounded-lg transition-all"
          >
            +90 ngày
          </button>
          <button 
            type="button"
            onClick={() => handleAddDays(365)}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] rounded-lg transition-all"
          >
            +1 năm
          </button>
        </div>

        <button 
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
        >
          {submitting ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle2 size={12} />}
          Lưu cấu hình gói
        </button>
      </div>
    </div>
  );
}
