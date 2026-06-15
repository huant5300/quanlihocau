"use client";

import React, { useState } from "react";
import { 
  History, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Calendar, 
  User, 
  DollarSign, 
  CreditCard, 
  FileText,
  TrendingUp,
  Clock
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getActiveShiftSession, 
  startShiftSession, 
  closeShiftSession, 
  getShiftSessionsHistory 
} from "@/actions/shift-actions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { UserRole } from "@prisma/client";

export default function ShiftsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);

  // Fetch active shift
  const { data: activeShift, isLoading: isLoadingActive, refetch: refetchActive } = useQuery({
    queryKey: ["active-shift"],
    queryFn: async () => {
      const res = await getActiveShiftSession();
      if (res.success) return res.data;
      throw new Error(res.error);
    }
  });

  // Fetch shift history
  const { data: history = [], isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["shift-history"],
    queryFn: async () => {
      const res = await getShiftSessionsHistory();
      if (res.success) return res.data;
      throw new Error(res.error);
    }
  });

  const handleStartShift = async () => {
    setIsSubmitting(true);
    try {
      const res = await startShiftSession("Bắt đầu ca trực");
      if (res.success) {
        toast.success("Bắt đầu ca làm việc thành công");
        queryClient.invalidateQueries({ queryKey: ["active-shift"] });
        queryClient.invalidateQueries({ queryKey: ["shift-history"] });
      } else {
        toast.error(res.error || "Không thể bắt đầu ca trực");
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeShift) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const actualCash = Number(formData.get("actualCash"));
      const notes = formData.get("notes") as string;

      if (Number.isNaN(actualCash) || actualCash < 0) {
        toast.error("Vui lòng nhập số tiền mặt hợp lệ");
        setIsSubmitting(false);
        return;
      }

      const res = await closeShiftSession({
        shiftId: activeShift.id,
        actualCash,
        notes,
      });

      if (res.success) {
        toast.success("Chốt ca và bàn giao thành công");
        setShowCloseForm(false);
        queryClient.invalidateQueries({ queryKey: ["active-shift"] });
        queryClient.invalidateQueries({ queryKey: ["shift-history"] });
      } else {
        toast.error(res.error || "Lỗi khi chốt ca");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userRole = session?.user?.role || UserRole.STAFF;
  const isOwnerOrManager = userRole === UserRole.OWNER || userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MANAGER;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase">Bàn giao ca & Dòng tiền</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý dòng tiền mặt, doanh thu ca trực và lịch sử bàn giao quỹ.
        </p>
      </div>

      {isLoadingActive ? (
        <div className="h-64 flex items-center justify-center bg-card/10 border border-white/5 rounded-[2.5rem]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : activeShift ? (
        /* Ca đang chạy */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Trạng thái ca trực (Left 7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden border border-emerald-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ca đang hoạt động</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  ID Ca: #{activeShift.id.substring(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nhân viên trực</p>
                  <p className="text-lg font-black uppercase mt-1 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    {activeShift.user?.name || activeShift.user?.username || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Bắt đầu trực</p>
                  <p className="text-sm font-bold mt-1.5 flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    {new Date(activeShift.startTime).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Doanh thu thống kê */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-accent/20 p-5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Doanh thu Vé câu</p>
                  <p className="text-lg font-black text-primary mt-1">
                    {(activeShift.summary?.ticketRevenue || 0).toLocaleString()}đ
                  </p>
                </div>
                <div className="bg-accent/20 p-5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Doanh thu Sản phẩm</p>
                  <p className="text-lg font-black text-primary mt-1">
                    {(activeShift.summary?.productRevenue || 0).toLocaleString()}đ
                  </p>
                </div>
                <div className="bg-accent/20 p-5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Doanh thu Tổng ca</p>
                  <p className="text-lg font-black text-emerald-500 mt-1">
                    {(activeShift.summary?.totalRevenue || 0).toLocaleString()}đ
                  </p>
                </div>
              </div>

              {/* Dòng tiền chi tiết */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign size={16} /> Tiền mặt (Cash) nhận về:
                  </span>
                  <span className="font-black text-foreground">
                    {(activeShift.summary?.totalCash || 0).toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard size={16} /> Chuyển khoản (Transfer):
                  </span>
                  <span className="font-black text-foreground">
                    {(activeShift.summary?.totalTransfer || 0).toLocaleString()}đ
                  </span>
                </div>
              </div>

              {!showCloseForm && (
                <button 
                  onClick={() => setShowCloseForm(true)}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-8 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 size={16} />
                  Tiến hành chốt ca
                </button>
              )}
            </div>
          </div>

          {/* Form chốt ca (Right 5 Columns) */}
          <div className="lg:col-span-5">
            {showCloseForm ? (
              <div className="glass-card p-8 rounded-[2.5rem] border border-primary/20 animate-in slide-in-from-right-3 duration-300">
                <h2 className="text-xl font-black uppercase mb-4 tracking-tight">Kê khai quỹ tiền mặt</h2>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  Đếm số tiền mặt thực tế đang có trong két của bạn để bàn giao. Hệ thống sẽ tự động tính toán chênh lệch chốt ca.
                </p>

                <form onSubmit={handleCloseShift} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                      Số tiền mặt trong két kỳ vọng:
                    </label>
                    <div className="w-full h-14 px-4 bg-accent/30 rounded-2xl border border-white/5 flex items-center font-black text-emerald-500 text-lg">
                      {(activeShift.summary?.expectedCash || 0).toLocaleString()}đ
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                      Số tiền mặt thực tế đếm được *
                    </label>
                    <input 
                      name="actualCash"
                      type="number"
                      required
                      min="0"
                      className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold text-lg"
                      placeholder="e.g. 500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                      Ghi chú bàn giao
                    </label>
                    <textarea 
                      name="notes"
                      rows={3}
                      className="w-full p-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold text-sm resize-none"
                      placeholder="Ghi chú thêm về chênh lệch tiền mặt hoặc bàn giao tài sản..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowCloseForm(false)}
                      className="h-14 bg-accent/50 hover:bg-accent text-foreground rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                      Chốt & Bàn giao
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center text-center h-full min-h-[300px]">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp size={32} />
                </div>
                <h3 className="font-black text-lg mb-1 uppercase tracking-tight">Vận hành an toàn</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Tất cả các giao dịch bán hàng, thu phí giờ câu đều được đồng bộ thời gian thực vào ca làm việc hiện hành của bạn.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Chưa mở ca */
        <div className="glass-card p-12 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6">
            <Play size={40} className="fill-current pl-1" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Chưa bắt đầu ca làm việc</h2>
          <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
            Bạn cần bắt đầu mở ca trực để kích hoạt tính năng kiểm soát doanh thu, bán hàng và bắt đầu ca câu cho khách.
          </p>
          <button 
            onClick={handleStartShift}
            disabled={isSubmitting}
            className="h-16 px-10 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Play size={16} className="fill-current" />}
            Bắt đầu ca trực ngay
          </button>
        </div>
      )}

      {/* Lịch sử các ca câu (Chỉ hiển thị cho Owner/Manager/SuperAdmin) */}
      {isOwnerOrManager && (
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Nhật ký & Đối soát ca câu</h2>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                Danh sách chi tiết đối soát dòng tiền bàn giao các ca trực
              </p>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar pt-2">
            {isLoadingHistory ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-medium uppercase text-[10px] tracking-widest bg-accent/10 rounded-2xl">
                Chưa có dữ liệu lịch sử ca trực nào
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="pb-4 pl-4">Nhân viên trực</th>
                    <th className="pb-4">Giờ bắt đầu</th>
                    <th className="pb-4">Giờ chốt</th>
                    <th className="pb-4 text-right">Doanh thu Vé</th>
                    <th className="pb-4 text-right">Doanh thu Hàng</th>
                    <th className="pb-4 text-right">Tổng doanh thu</th>
                    <th className="pb-4 text-center">Trạng thái</th>
                    <th className="pb-4 pr-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s: any) => (
                    <tr key={s.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-all">
                      <td className="py-4 pl-4 font-black flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black uppercase text-[10px]">
                          {s.staffName.charAt(0)}
                        </div>
                        {s.staffName}
                      </td>
                      <td className="py-4 text-xs font-bold text-muted-foreground">
                        {new Date(s.startTime).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-4 text-xs font-bold text-muted-foreground">
                        {s.endTime ? new Date(s.endTime).toLocaleString("vi-VN") : "Chưa chốt"}
                      </td>
                      <td className="py-4 text-right font-black text-primary">
                        {s.ticketRevenue.toLocaleString()}đ
                      </td>
                      <td className="py-4 text-right font-black text-primary">
                        {s.productRevenue.toLocaleString()}đ
                      </td>
                      <td className="py-4 text-right font-black text-emerald-500">
                        {s.totalRevenue.toLocaleString()}đ
                      </td>
                      <td className="py-4 text-center">
                        <span className={cn(
                          "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          s.status === "CLOSED" ? "bg-zinc-500/15 text-zinc-400" : "bg-emerald-500/15 text-emerald-400"
                        )}>
                          {s.status === "CLOSED" ? "Đã chốt" : "Đang chạy"}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-semibold text-muted-foreground truncate max-w-[150px] pr-4">
                        {s.notes || "Không có ghi chú"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
