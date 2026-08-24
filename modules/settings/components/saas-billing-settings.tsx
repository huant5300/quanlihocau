"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  Check, 
  QrCode, 
  Info,
  Flame,
  Sparkles,
  Gift,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { 
  getLakeSubscriptionDetails, 
  createSubscriptionOrder, 
  getMySubscriptionOrders 
} from "@/actions/subscription-actions";

export function SaasBillingSettings() {
  const [loading, setLoading] = useState(true);
  const [subDetails, setSubDetails] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  
  // State nâng cấp gói
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">("BASIC");
  const [duration, setDuration] = useState<number>(12); // mặc định 12 tháng để kích hoạt ưu đãi cao nhất
  const [submitting, setSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [detailsRes, ordersRes] = await Promise.all([
        getLakeSubscriptionDetails(),
        getMySubscriptionOrders()
      ]);

      if (detailsRes.success && detailsRes.data) {
        setSubDetails(detailsRes.data as any);
      } else {
        toast.error(detailsRes.error || "Không thể lấy thông tin gói cước");
      }

      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success("Đã sao chép nội dung chuyển khoản!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Tính tiền & ưu đãi tặng thêm tháng (12 tháng tặng 3 tháng = 15 tháng, 6 tháng tặng 1 tháng = 7 tháng)
  const getPricingInfo = (plan: "BASIC" | "PREMIUM", months: number) => {
    const basePrice = plan === "BASIC" ? 99000 : 199000;
    const rawTotal = basePrice * months;
    
    let bonusMonths = 0;
    let badgeText = "";
    if (months === 12) {
      bonusMonths = 3;
      badgeText = "TẶNG +3 THÁNG MIỄN PHÍ";
    } else if (months === 6) {
      bonusMonths = 1;
      badgeText = "TẶNG +1 THÁNG MIỄN PHÍ";
    }

    const totalActiveMonths = months + bonusMonths;
    const effectivePricePerMonth = Math.round(rawTotal / totalActiveMonths);
    const savedAmount = bonusMonths * basePrice;

    return {
      pricePerMonth: basePrice,
      rawTotal,
      finalTotal: rawTotal,
      bonusMonths,
      totalActiveMonths,
      effectivePricePerMonth,
      savedAmount,
      badgeText,
    };
  };

  const pricing = getPricingInfo(selectedPlan, duration);

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const res = await createSubscriptionOrder({
        plan: selectedPlan,
        durationMonths: duration,
      });

      if (res.success && res.data) {
        setActiveOrder(res.data);
        toast.success("Yêu cầu nâng cấp đã được tạo! Vui lòng chuyển khoản thanh toán.");
        fetchDetails(); // Reload history
      } else {
        toast.error(res.error || "Tạo yêu cầu thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-card/10 border border-white/5 rounded-[2.5rem]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const bankNo = "0963529999";
  const bankName = "MBBank";
  const accountName = "NGUYEN HOANG HUAN";
  const transferContent = activeOrder ? `FISHING_SAAS_SUB_${activeOrder.id}` : "";
  const vietQrUrl = activeOrder 
    ? `https://img.vietqr.io/image/${bankName}-${bankNo}-compact2.png?amount=${pricing.finalTotal}&addInfo=${transferContent}&accountName=${encodeURIComponent(accountName)}`
    : "";

  return (
    <div className="space-y-8">
      {/* 1. Gói cước hiện tại */}
      {subDetails && (
        <SettingsCard 
          title="Gói dịch vụ hiện tại" 
          description="Quản lý thời hạn và kiểm soát giới hạn tài nguyên của hồ."
          icon={CreditCard}
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-accent/20 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tên gói cước</p>
                <h4 className="text-xl font-black uppercase text-primary">
                  {subDetails.limits.name}
                </h4>
              </div>
              <div className="space-y-1 sm:text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trạng thái / Ngày hết hạn</p>
                <div className="flex items-center sm:justify-end gap-2">
                  <span className={cn(
                    "inline-block w-2.5 h-2.5 rounded-full",
                    subDetails.isExpired ? "bg-red-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                  )} />
                  <span className={cn(
                    "text-sm font-black",
                    subDetails.isExpired ? "text-red-500" : "text-emerald-500"
                  )}>
                    {subDetails.isExpired ? "ĐÃ HẾT HẠN" : "ĐANG HOẠT ĐỘNG"}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground ml-1">
                    ({subDetails.expiresAt ? new Date(subDetails.expiresAt).toLocaleDateString("vi-VN") : "Vĩnh viễn"})
                  </span>
                </div>
              </div>
            </div>

            {/* Mức sử dụng tài nguyên */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tài nguyên đã sử dụng</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chòi */}
                <div className="bg-accent/10 border border-white/5 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Vị trí / Chòi câu</span>
                    <span className="text-foreground font-black">
                      {subDetails.usage.huts} / {subDetails.limits.maxHuts > 1000 ? "Vô hạn" : subDetails.limits.maxHuts}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (subDetails.usage.huts / subDetails.limits.maxHuts) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Nhân viên */}
                <div className="bg-accent/10 border border-white/5 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Nhân viên trực</span>
                    <span className="text-foreground font-black">
                      {subDetails.usage.staff} / {subDetails.limits.maxStaff > 1000 ? "Vô hạn" : subDetails.limits.maxStaff}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (subDetails.usage.staff / subDetails.limits.maxStaff) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Khách */}
                <div className="bg-accent/10 border border-white/5 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Khách hàng lưu trữ</span>
                    <span className="text-foreground font-black">
                      {subDetails.usage.customers} / {subDetails.limits.maxCustomers > 1000 ? "Vô hạn" : subDetails.limits.maxCustomers}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (subDetails.usage.customers / subDetails.limits.maxCustomers) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* 2. Đăng ký / Nâng cấp gói */}
      <SettingsCard
        title="Nâng cấp & Gia hạn dịch vụ"
        description="Lựa chọn các gói dịch vụ phù hợp với quy mô hồ câu của bạn."
        icon={CreditCard}
      >
        <div className="space-y-6">
          
          {/* 🔥 LIMITED-TIME OFFER BANNER */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-orange-500/20 border-2 border-amber-500/30 dark:border-amber-500/40 shadow-xl shadow-amber-500/10">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 animate-bounce">
                  <Flame size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <Zap size={10} /> Ưu Đãi Có Hạn
                    </span>
                    <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                      <Clock size={12} /> Áp dụng ngay hôm nay
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    Đăng Ký 1 Năm <span className="text-rose-500 underline underline-offset-4">TẶNG NGAY 3 THÁNG</span> | 6 Tháng <span className="text-amber-500 underline underline-offset-4">TẶNG 1 THÁNG</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-semibold mt-0.5">
                    Nhận trọn vẹn lên đến <strong className="text-emerald-500">15 tháng sử dụng</strong> với chi phí siêu tiết kiệm chỉ từ 79k/tháng!
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setDuration(12)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/25 flex items-center gap-1.5 transition-all"
                >
                  <Gift size={14} />
                  Chọn Gói 1 Năm (+3 Tháng)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chọn gói & thời gian (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Chọn Gói cước */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Gói BASIC */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan("BASIC")}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left space-y-3 transition-all relative overflow-hidden",
                    selectedPlan === "BASIC" 
                      ? "border-emerald-500 bg-emerald-500/5 text-foreground shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20" 
                      : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-accent/20 text-muted-foreground hover:border-slate-300 dark:hover:border-white/15"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                      1 Hồ Độc Lập
                    </span>
                    {selectedPlan === "BASIC" && <CheckCircle2 size={16} className="text-emerald-500" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase text-emerald-600 dark:text-emerald-400">BASIC (1 Hồ)</h4>
                    <p className="text-2xl font-black text-foreground mt-0.5">
                      99.000đ<span className="text-xs font-semibold text-muted-foreground">/tháng</span>
                    </p>
                  </div>

                  <ul className="text-[11px] space-y-2 font-bold pt-2 border-t border-slate-200 dark:border-white/5">
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> 1 Hồ câu duy nhất</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Tối đa 2 Nhân viên / Thu ngân</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Full tính năng tạo vé & đếm ngược</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> In bill nhiệt Bluetooth 58mm (PT-210)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Thu cá trừ bill & Tự tính tiền</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Tự động tạo mã VietQR quét tiền</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Quản lý kho hàng & Quản lý cá</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Chốt ca & Báo cáo doanh thu</li>
                  </ul>
                </button>

                {/* Gói PREMIUM */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan("PREMIUM")}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left space-y-3 transition-all relative overflow-hidden",
                    selectedPlan === "PREMIUM" 
                      ? "border-primary bg-primary/5 text-foreground shadow-lg shadow-primary/10 ring-2 ring-primary/20" 
                      : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-accent/20 text-muted-foreground hover:border-slate-300 dark:hover:border-white/15"
                  )}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                    <Sparkles size={10} /> Chuỗi 5 Hồ
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                      Quản lý 5 Hồ
                    </span>
                    {selectedPlan === "PREMIUM" && <CheckCircle2 size={16} className="text-primary" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase text-primary">PREMIUM (Chuỗi Hồ)</h4>
                    <p className="text-2xl font-black text-foreground mt-0.5">
                      199.000đ<span className="text-xs font-semibold text-muted-foreground">/tháng</span>
                    </p>
                  </div>

                  <ul className="text-[11px] space-y-2 font-bold pt-2 border-t border-slate-200 dark:border-white/5">
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Quản lý đến 5 Hồ câu độc lập</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Tối đa 10 Nhân viên / Thu ngân</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Full toàn bộ tính năng như Basic</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Chuyển đổi linh hoạt giữa các hồ</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Báo cáo tổng hợp doanh thu chuỗi</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Không giới hạn khách hàng CRM</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Ưu tiên cập nhật tính năng mới</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Hỗ trợ kỹ thuật 24/7</li>
                  </ul>
                </button>
              </div>

              {/* Chọn Thời gian đăng ký với Offer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200 ml-1 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" /> Thời gian đăng ký & Ưu đãi
                  </label>
                  <span className="text-[11px] font-bold text-rose-500">Đăng ký dài hạn = Tặng thêm tháng</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* 1 Tháng */}
                  <button
                    type="button"
                    onClick={() => setDuration(1)}
                    className={cn(
                      "h-16 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-0.5",
                      duration === 1 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md" 
                        : "bg-slate-50 dark:bg-accent/20 border-slate-200 dark:border-white/5 hover:border-slate-300 text-slate-700 dark:text-zinc-300"
                    )}
                  >
                    <span>1 Tháng</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">Tiêu chuẩn</span>
                  </button>

                  {/* 3 Tháng */}
                  <button
                    type="button"
                    onClick={() => setDuration(3)}
                    className={cn(
                      "h-16 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-0.5",
                      duration === 3 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md" 
                        : "bg-slate-50 dark:bg-accent/20 border-slate-200 dark:border-white/5 hover:border-slate-300 text-slate-700 dark:text-zinc-300"
                    )}
                  >
                    <span>3 Tháng</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">Tiêu chuẩn</span>
                  </button>

                  {/* 6 Tháng (TẶNG 1 THÁNG = 7T) */}
                  <button
                    type="button"
                    onClick={() => setDuration(6)}
                    className={cn(
                      "h-16 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border relative flex flex-col items-center justify-center gap-0.5 overflow-hidden",
                      duration === 6 
                        ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25 ring-2 ring-amber-500/30" 
                        : "bg-amber-500/10 border-amber-500/30 hover:border-amber-500 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest bg-amber-600 text-white px-2 py-0.5 rounded-full absolute top-1">
                      +1 Tháng FREE
                    </span>
                    <span className="mt-3">6 Tháng</span>
                    <span className="text-[9px] font-bold opacity-90">(Nhận 7 Tháng)</span>
                  </button>

                  {/* 12 Tháng (TẶNG 3 THÁNG = 15T - BEST DEAL) */}
                  <button
                    type="button"
                    onClick={() => setDuration(12)}
                    className={cn(
                      "h-16 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border relative flex flex-col items-center justify-center gap-0.5 overflow-hidden",
                      duration === 12 
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 border-rose-500 text-white shadow-xl shadow-rose-500/30 ring-2 ring-rose-500/40" 
                        : "bg-rose-500/10 border-rose-500/30 hover:border-rose-500 text-rose-600 dark:text-rose-300"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest bg-rose-600 text-white px-2 py-0.5 rounded-full absolute top-1 animate-pulse">
                      🔥 TẶNG 3 THÁNG
                    </span>
                    <span className="mt-3">1 Năm (12T)</span>
                    <span className="text-[9px] font-bold opacity-90">(Nhận 15 Tháng)</span>
                  </button>

                </div>
              </div>
            </div>

            {/* Hóa đơn & Button thanh toán (Right 5 Columns) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 dark:bg-accent/15 border-2 border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-6 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Chi tiết thanh toán
                  </h4>
                  {pricing.bonusMonths > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                      Đã áp dụng ưu đãi
                    </span>
                  )}
                </div>
                
                <div className="space-y-3.5 text-xs font-bold text-slate-600 dark:text-zinc-400">
                  
                  <div className="flex justify-between">
                    <span>Gói đã chọn:</span>
                    <span className="text-slate-900 dark:text-white font-extrabold uppercase">
                      {selectedPlan === "BASIC" ? "BASIC (1 Hồ)" : "PREMIUM (Chuỗi 5 Hồ)"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Đơn giá tiêu chuẩn:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{pricing.pricePerMonth.toLocaleString()}đ / tháng</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Thời gian mua:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{duration} Tháng</span>
                  </div>

                  {pricing.bonusMonths > 0 && (
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 text-rose-600 dark:text-rose-400 font-black">
                      <span className="flex items-center gap-1.5">
                        <Gift size={14} className="text-rose-500 shrink-0" />
                        Quà tặng thêm:
                      </span>
                      <span className="text-xs uppercase">+{pricing.bonusMonths} Tháng Miễn Phí</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Tổng thời gian sử dụng:</span>
                    <span className="font-black text-sm">
                      {pricing.totalActiveMonths} Tháng
                    </span>
                  </div>

                  {pricing.bonusMonths > 0 && (
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Giá tương đương chỉ:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        ~{pricing.effectivePricePerMonth.toLocaleString()}đ / tháng
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t-2 border-dashed border-slate-200 dark:border-white/10 pt-4 text-sm font-black text-slate-900 dark:text-white">
                    <span className="uppercase tracking-wider">Tổng thanh toán:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">{pricing.finalTotal.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* CTA BUTTON */}
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={submitting}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Zap size={18} className="animate-pulse" />
                  )}
                  <span>
                    {pricing.bonusMonths > 0 
                      ? `Nhận Ưu Đãi & Kích Hoạt (${pricing.totalActiveMonths} Tháng)`
                      : "Gửi Yêu Cầu Nâng Cấp"}
                  </span>
                </button>

                <p className="text-[10px] text-center text-slate-400 font-semibold leading-relaxed">
                  🔒 Tự động tạo mã QR VietQR chuẩn xác. Kích hoạt ngay sau khi chuyển khoản.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* 3. Dialog hiển thị VietQR khi có activeOrder */}
      {activeOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative space-y-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black uppercase text-center text-white flex items-center justify-center gap-2">
              <QrCode className="text-primary animate-pulse" size={24} />
              Thanh Toán Qua Chuyển Khoản VietQR
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Cột VietQR (Trái) */}
              <div className="bg-white p-4 rounded-3xl flex items-center justify-center shadow-lg border border-white/10 max-w-[280px] mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={vietQrUrl} 
                  alt="Mã QR chuyển khoản VietQR" 
                  className="w-full h-auto aspect-square object-contain"
                />
              </div>

              {/* Hướng dẫn chuyển khoản (Phải) */}
              <div className="space-y-4">
                <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5 text-xs font-semibold text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Ngân hàng:</span>
                    <span className="text-white font-bold">{bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chủ tài khoản:</span>
                    <span className="text-white font-bold">{accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tài khoản:</span>
                    <span className="text-white font-black">{bankNo}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-3">
                    <span>Số tiền:</span>
                    <span className="text-emerald-400 font-black text-sm">{pricing.finalTotal.toLocaleString()}đ</span>
                  </div>
                  {pricing.bonusMonths > 0 && (
                    <div className="flex justify-between text-rose-400 font-bold text-[11px]">
                      <span>Ưu đãi áp dụng:</span>
                      <span>+{pricing.bonusMonths} Tháng Miễn Phí (Tổng {pricing.totalActiveMonths}T)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nội dung chuyển khoản chính xác *</label>
                  <div className="flex items-center gap-2 h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-sm">
                    <span className="flex-1 truncate">{transferContent}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferContent)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all"
                    >
                      {copiedText ? <Check className="text-emerald-500" size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/15 leading-relaxed">
                  <Info className="shrink-0" size={16} />
                  <span>
                    <strong>Chú ý:</strong> Quét QR trên ứng dụng ngân hàng để tự điền nội dung. Nếu nhập tay, hãy ghi chính xác nội dung ở trên để đơn được duyệt tự động/nhanh nhất.
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveOrder(null);
                  fetchDetails();
                }}
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                Tôi Đã Chuyển Khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Lịch sử yêu cầu */}
      {orders.length > 0 && (
        <SettingsCard
          title="Lịch sử giao dịch & Nâng cấp"
          description="Danh sách các đơn hàng nâng cấp gói cước hồ câu của bạn."
          icon={CreditCard}
        >
          <div className="divide-y divide-white/5">
            {orders.map((o: any) => (
              <div key={o.id} className="py-4 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-foreground uppercase tracking-wider">{o.plan}</span>
                    <span className="text-muted-foreground">({o.durationMonths} Tháng {o.durationMonths === 12 ? "+ 3T tặng" : o.durationMonths === 6 ? "+ 1T tặng" : ""})</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Mã đơn: <span className="text-foreground font-mono font-bold">{o.id}</span> • {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-black text-foreground">{o.amount.toLocaleString()}đ</p>
                  <span className={cn(
                    "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    o.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                    o.status === "REJECTED" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                    "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  )}>
                    {o.status === "APPROVED" ? "ĐÃ DUYỆT" :
                     o.status === "REJECTED" ? "ĐÃ HỦY" : "CHỜ DUYỆT"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
