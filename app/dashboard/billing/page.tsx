"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle,
  Copy,
  Crown,
  Building2,
  PhoneCall,
  Gift,
  HelpCircle,
  RefreshCw,
  Check,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface DurationOption {
  months: number;
  price: number;
  bonusMonths: number;
  label: string;
  totalMonths: number;
  popular?: boolean;
  bestValue?: boolean;
  avgMonthly?: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  monthlyPrice: number;
  durationDays: number;
  maxLakes: number;
  badge?: string;
  description?: string;
  features: string[];
  durations?: DurationOption[];
}

interface SubscriptionOrder {
  id: string;
  plan: string;
  durationMonths: number;
  amount: number;
  status: string;
  createdAt: string;
}

export default function BillingPage() {
  const [lakeData, setLakeData] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Chọn thời hạn: 1 tháng | 6 tháng (tặng 1 tháng) | 12 tháng (tặng 3 tháng)
  const [selectedDurationMonths, setSelectedDurationMonths] = useState<number>(6);
  
  // State khi bấm nâng cấp
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [activatedInfo, setActivatedInfo] = useState<any>(null);

  // Polling ref cho realtime auto-activation
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const res = await fetch("/api/v1/billing");
      const data = await res.json();
      if (res.ok && data.success) {
        setLakeData(data.lake);
        setDaysRemaining(data.daysRemaining);
        setIsExpired(data.isExpired);
        setPlans(data.plans || []);
        setPaymentInfo(data.paymentInfo);
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || "Không thể tải thông tin gói cước");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Play sound effect khi kích hoạt thành công (Web Audio API)
  const playSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(523.25, now, 0.4); // C5
        playTone(659.25, now + 0.15, 0.4); // E5
        playTone(783.99, now + 0.3, 0.6); // G5
        playTone(1046.50, now + 0.45, 0.8); // C6
      }
    } catch (e) {
      console.log("Audio play error:", e);
    }
  };

  // Khi mở modal QR thanh toán, bật realtime polling lắng nghe tự động kích hoạt 24/7
  useEffect(() => {
    if (selectedPlan && qrData?.orderId) {
      // Bắt đầu thăm dò mỗi 2.5 giây
      pollingTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/v1/billing/check-status?orderId=${qrData.orderId}&lakeId=${lakeData?.id || ""}`);
          const data = await res.json();
          if (res.ok && data.success && data.isActivated) {
            // Đã nhận được webhook hoặc duyệt tự động thành công!
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            playSuccessSound();
            setActivatedInfo({
              planName: selectedPlan.name,
              expiresAt: data.lake?.expiresAt,
              daysRemaining: data.daysRemaining,
            });
            setSelectedPlan(null);
            setQrData(null);
            setIsSuccessModalOpen(true);
            toast.success(`🎉 Tự động kích hoạt thành công gói ${selectedPlan.name}!`);
            await fetchBillingInfo(true);
          }
        } catch (pollErr) {
          console.log("Polling check status error:", pollErr);
        }
      }, 2500);
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [selectedPlan, qrData, lakeData]);

  // Xử lý khi chọn gói cước để thanh toán VietQR
  const handleSelectPlan = async (plan: Plan) => {
    if (plan.price === 0) {
      toast.info("Gói Dùng Thử Miễn Phí 5 Ngày được kích hoạt tự động cho mọi hồ mới tạo!");
      return;
    }

    setSelectedPlan(plan);
    setIsGeneratingQr(true);
    try {
      const res = await fetch("/api/v1/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: plan.id,
          durationMonths: selectedDurationMonths 
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQrData(data);
      } else {
        toast.error(data.error || "Không thể tạo mã QR thanh toán");
        setSelectedPlan(null);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ tạo giao dịch");
      setSelectedPlan(null);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Kích hoạt ngay lập tức khi người dùng bấm "Tôi đã chuyển khoản"
  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setIsActivating(true);
    try {
      const res = await fetch("/api/v1/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: selectedPlan.id,
          durationMonths: selectedDurationMonths,
          orderId: qrData?.orderId
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSuccessSound();
        setActivatedInfo({
          planName: selectedPlan.name,
          expiresAt: data.expiresAt,
          durationMonths: selectedDurationMonths,
        });
        setSelectedPlan(null);
        setQrData(null);
        setIsSuccessModalOpen(true);
        toast.success(data.message || `Đã kích hoạt thành công ${selectedPlan.name}! 🎉`);
        await fetchBillingInfo(true);
      } else {
        toast.error(data.error || "Không thể kích hoạt gói cước");
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi kích hoạt gói");
    } finally {
      setIsActivating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  // Tính toán giá hiển thị theo thời hạn đang chọn
  const calculatePlanPrice = (plan: Plan) => {
    if (plan.price === 0) return { total: 0, avgMonthly: 0, bonusMonths: 0, totalMonths: 0 };
    if (selectedDurationMonths === 12) {
      const total = plan.monthlyPrice * 12;
      return { total, avgMonthly: Math.round(total / 15), bonusMonths: 3, totalMonths: 15 };
    }
    if (selectedDurationMonths === 6) {
      const total = plan.monthlyPrice * 6;
      return { total, avgMonthly: Math.round(total / 7), bonusMonths: 1, totalMonths: 7 };
    }
    return { total: plan.monthlyPrice, avgMonthly: plan.monthlyPrice, bonusMonths: 0, totalMonths: 1 };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 animate-pulse">
            <CreditCard size={24} />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Đang đồng bộ thông tin bản quyền Realtime...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-16">
      
      {/* ── BANNER TRẠNG THÁI BẢN QUYỀN REALTIME ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Glow decoration */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-emerald-100 border border-white/20">
            <Gift size={13} className="text-amber-300 animate-bounce" />
            <span>Chương trình trợ giá Chủ hồ câu toàn quốc</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Gói Cước Thuê Bao Phần Mềm SaaS
          </h1>

          <p className="text-xs sm:text-sm text-emerald-50 font-medium leading-relaxed">
            Hệ thống Cloud POS chuyên biệt cho Hồ Câu Dịch Vụ: Bán vé tự động, đếm ngược tính giờ, bán mồi, cân cá, in bill nhiệt 58mm và đối soát doanh thu.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              Đã kết nối máy chủ Realtime
            </span>
            <button
              onClick={() => fetchBillingInfo(true)}
              disabled={isRefreshing}
              className="text-[11px] font-bold text-white/80 hover:text-white underline flex items-center gap-1 transition-colors"
              title="Làm mới trạng thái"
            >
              <RefreshCw size={12} className={cn(isRefreshing && "animate-spin text-amber-300")} />
              <span>{isRefreshing ? "Đang làm mới..." : "Làm mới"}</span>
            </button>
          </div>
        </div>

        {/* Current status pill */}
        <div className="bg-white/15 backdrop-blur-xl border border-white/25 p-5 rounded-2xl shrink-0 text-center space-y-2 relative z-10 shadow-lg min-w-[240px]">
          <div className="text-[10px] font-black tracking-widest uppercase text-emerald-100">
            Trạng thái bản quyền
          </div>
          
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            {isExpired ? (
              <span className="text-rose-300 flex items-center justify-center gap-1.5">
                <AlertTriangle size={22} />
                Đã hết hạn
              </span>
            ) : (
              <span className="text-white flex items-center justify-center gap-1.5">
                <ShieldCheck size={24} className="text-emerald-300" />
                Còn lại {daysRemaining} ngày
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-emerald-100 bg-white/10 py-1 px-2.5 rounded-xl border border-white/10 truncate">
            {lakeData?.name || "Hồ câu dịch vụ"}
          </div>

          <div className="text-[10px] font-medium text-emerald-200">
            Gói hiện tại: <span className="font-black uppercase text-amber-300">{lakeData?.subscriptionPlan || "TRIAL"}</span>
            {lakeData?.subscriptionExpiresAt && (
              <span className="block text-[9px] text-emerald-300 mt-0.5">
                Hết hạn: {format(new Date(lakeData.subscriptionExpiresAt), "dd/MM/yyyy")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── BỘ CHỌN THỜI HẠN & KHUYẾN MÃI (PRD §10.3) ── */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
            Ưu đãi có hạn theo tháng
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Chọn chu kỳ thanh toán để nhận thêm tháng tặng
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Đăng ký dài hạn được cộng trực tiếp thêm tháng vào hệ thống tự động
          </p>
        </div>

        {/* 3 Chu kỳ lựa chọn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-2">
          {/* 1 Tháng */}
          <button
            type="button"
            onClick={() => setSelectedDurationMonths(1)}
            className={cn(
              "p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between",
              selectedDurationMonths === 1
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 bg-slate-50/50 dark:bg-zinc-800/40"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">1 Tháng</span>
              {selectedDurationMonths === 1 && <Check size={16} className="text-emerald-600 font-black" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">Đăng ký từng tháng</p>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-2">
              Giá chuẩn
            </div>
          </button>

          {/* 6 Tháng (Tặng 1 tháng = 7 tháng) */}
          <button
            type="button"
            onClick={() => setSelectedDurationMonths(6)}
            className={cn(
              "p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between",
              selectedDurationMonths === 6
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 bg-slate-50/50 dark:bg-zinc-800/40"
            )}
          >
            <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              + Tặng 1 Tháng
            </div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">6 Tháng</span>
              {selectedDurationMonths === 6 && <Check size={16} className="text-emerald-600 font-black" />}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">Tổng nhận: 7 Tháng</p>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-2">
              Tiết kiệm ~15%
            </div>
          </button>

          {/* 12 Tháng (Tặng 3 tháng = 15 tháng) ⭐ Best */}
          <button
            type="button"
            onClick={() => setSelectedDurationMonths(12)}
            className={cn(
              "p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between",
              selectedDurationMonths === 12
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-md ring-2 ring-amber-500/30"
                : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 bg-slate-50/50 dark:bg-zinc-800/40"
            )}
          >
            <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Crown size={10} /> + Tặng 3 Tháng Free
            </div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">1 Năm (12 Tháng)</span>
              {selectedDurationMonths === 12 && <Check size={16} className="text-amber-500 font-black" />}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">Tổng nhận: 15 Tháng</p>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-2">
              Tiết kiệm ~25% (Rẻ nhất)
            </div>
          </button>
        </div>
      </div>

      {/* ── BẢNG CÁC GÓI CƯỚC THỰC TẾ (PRD §10.1 & §10.2) ── */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isCurrent = lakeData?.subscriptionPlan === plan.id;
            const isSilver = plan.id === "SILVER" || plan.id === "BASIC";
            const isGold = plan.id === "GOLD" || plan.id === "PREMIUM";
            const isTrial = plan.id === "TRIAL" || plan.id === "FREE";

            const priceInfo = calculatePlanPrice(plan);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={cn(
                  "bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-7 border flex flex-col justify-between transition-all relative shadow-2xs",
                  isSilver && "border-emerald-500/80 shadow-md ring-2 ring-emerald-500/20",
                  isGold && "border-amber-400 shadow-md ring-2 ring-amber-400/30 bg-gradient-to-b from-amber-500/5 to-transparent",
                  isTrial && "border-slate-200/80 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/40"
                )}
              >
                {/* Popular / Best value badge */}
                {isSilver && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-sm tracking-wider">
                    {selectedDurationMonths === 12 ? "1 Hồ • 15 Tháng Sử Dụng" : "Phổ biến nhất • 1 Hồ Độc Quyền"}
                  </div>
                )}
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1 tracking-wider">
                    <Crown size={12} /> {selectedDurationMonths === 12 ? "Chuỗi 5 Hồ • 15 Tháng Sử Dụng" : "Chuỗi 5 Hồ Câu VIP"}
                  </div>
                )}

                <div>
                  {/* Plan Name & Price Header */}
                  <div className="pb-5 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-400 font-medium mt-1.5 min-h-[34px]">
                      {plan.description}
                    </p>

                    {/* Price Display */}
                    <div className="mt-4">
                      {isTrial ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">0 đ</span>
                          <span className="text-xs text-slate-400 font-bold">/ 5 ngày dùng thử</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                              {priceInfo.total.toLocaleString()} đ
                            </span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                              / {selectedDurationMonths} tháng
                            </span>
                          </div>

                          {priceInfo.bonusMonths > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                              <Sparkles size={13} className="shrink-0 animate-pulse" />
                              <span>Được tặng thêm +{priceInfo.bonusMonths} tháng = Tổng {priceInfo.totalMonths} tháng (~{priceInfo.avgMonthly.toLocaleString()}đ/tháng)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quota limit highlight */}
                  <div className="py-3.5 flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 border-b border-slate-100 dark:border-zinc-800">
                    <Building2 size={15} className="shrink-0" />
                    <span>Hạn ngạch: Tối đa {plan.maxLakes} Hồ câu độc lập</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 py-4 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-medium leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Action Button */}
                <div className="pt-5 border-t border-slate-100 dark:border-zinc-800">
                  {isTrial ? (
                    <button
                      disabled
                      className="w-full h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 font-bold text-xs cursor-not-allowed uppercase tracking-wider"
                    >
                      Gói trải nghiệm ban đầu
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isGeneratingQr && selectedPlan?.id === plan.id}
                      className={cn(
                        "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                        isSilver && "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25",
                        isGold && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                      )}
                    >
                      <Zap size={15} />
                      <span>{isCurrent ? "Gia hạn gói này ngay" : "Nâng cấp gói này"}</span>
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL THANH TOÁN VIETQR & TỰ ĐỘNG KÍCH HOẠT REALTIME ── */}
      <AnimatePresence>
        {selectedPlan && qrData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 max-h-[95vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Mã QR Thanh Toán Tự Động 24/7
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Kích hoạt {selectedPlan.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Thời hạn: <span className="font-extrabold text-slate-800 dark:text-zinc-200">{qrData.durationMonths} Tháng</span> {qrData.bonusMonths > 0 && <span className="text-emerald-600 font-black">(+Tặng {qrData.bonusMonths} Tháng = Tổng {qrData.totalMonths} Tháng)</span>}
                </p>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-50 dark:bg-zinc-800/80 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-700 flex flex-col items-center shadow-inner">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <img
                    src={qrData.qrUrl}
                    alt="VietQR Payment"
                    className="w-60 h-60 object-contain"
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-3 flex items-center gap-1.5 font-bold">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Quét bằng App Ngân Hàng (MB, Techcombank, Vietcombank, BIDV...)</span>
                </p>
              </div>

              {/* Realtime Listening Radar Effect */}
              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-emerald-800 dark:text-emerald-300">
                    Đang chờ ngân hàng xác nhận giao dịch...
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Hệ thống tự động kích hoạt ngay khi nhận tiền chuyển khoản (Realtime).
                  </p>
                </div>
              </div>

              {/* Payment Details to Copy */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500 font-bold">Số tiền chuyển:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                      {qrData.amount?.toLocaleString()} đ
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(qrData.amount.toString(), "Số tiền")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-500"
                      title="Sao chép số tiền"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500 font-bold">Ngân hàng nhận:</span>
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200">
                    {qrData.paymentInfo?.bankName}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500 font-bold">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {qrData.paymentInfo?.accountNo}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(qrData.paymentInfo?.accountNo, "Số tài khoản")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-500"
                      title="Sao chép số tài khoản"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500 font-bold">Chủ tài khoản:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 uppercase">
                    {qrData.paymentInfo?.accountName}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                  <span className="text-slate-500 font-bold">Nội dung CK:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                      {qrData.transferContent}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(qrData.transferContent, "Nội dung chuyển khoản")}
                      className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      title="Sao chép nội dung"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Upgrade Confirmation Button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isActivating}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer",
                  selectedPlan.id === "GOLD" || selectedPlan.id === "PREMIUM"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25",
                  isActivating && "opacity-75 cursor-not-allowed"
                )}
              >
                {isActivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Đang kích hoạt gói cước...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Tôi đã chuyển {qrData.amount?.toLocaleString()}đ — Kích hoạt ngay</span>
                  </>
                )}
              </button>

              {/* CSKH Support in Modal */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs space-y-1">
                <p className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                  <PhoneCall size={13} />
                  <span>Hỗ trợ chuyển khoản & Kích hoạt:</span>
                </p>
                <p className="text-slate-600 dark:text-zinc-300 text-[11px]">
                  Cần hỗ trợ gấp hoặc gặp trục trặc, vui lòng liên hệ Hotline / Zalo:{" "}
                  <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="font-black text-emerald-600 underline">
                    0855550813
                  </a>
                </p>
              </div>

              {/* Close & Direct Contact Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    setQrData(null);
                  }}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs transition-colors"
                >
                  Đóng lại
                </button>
                <a
                  href="https://zalo.me/0855550813"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall size={13} />
                  <span>Zalo CSKH (0855550813)</span>
                </a>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL CHÚC MỪNG KÍCH HOẠT THÀNH CÔNG (CELEBRATION MODAL) ── */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-[3rem] p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              {/* Decorative glow */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

              {/* Animated Icon */}
              <div className="w-20 h-20 mx-auto rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Giao dịch thành công
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Kích hoạt thành công! 🎉
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Hồ câu của bạn đã được nâng cấp lên{" "}
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {activatedInfo?.planName || "Gói Dịch Vụ"}
                  </span>
                  . Toàn bộ tính năng đã được mở khóa 100%.
                </p>
              </div>

              {activatedInfo?.expiresAt && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700 text-xs font-bold space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Hạn sử dụng mới:</span>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {format(new Date(activatedInfo.expiresAt), "dd/MM/yyyy (HH:mm)")}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
              >
                Bắt đầu sử dụng ngay
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LỊCH SỬ GIAO DỊCH THUÊ BAO DATABASE THỰC TẾ ── */}
      {orders.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Lịch sử đăng ký & gia hạn gói cước
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Dữ liệu giao dịch được lưu trữ và đối soát tự động trên hệ thống
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-bold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">Mã đơn</th>
                  <th className="pb-3">Gói dịch vụ</th>
                  <th className="pb-3 text-center">Thời hạn</th>
                  <th className="pb-3 text-right">Số tiền</th>
                  <th className="pb-3 text-center">Trạng thái</th>
                  <th className="pb-3 text-right pr-2">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-semibold">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 pl-2 font-mono text-[11px] text-slate-500">
                      {o.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 font-extrabold text-slate-900 dark:text-white">
                      {o.plan}
                    </td>
                    <td className="py-3 text-center text-slate-600 dark:text-zinc-300">
                      {o.durationMonths} Tháng
                    </td>
                    <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {o.amount.toLocaleString()}đ
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        o.status === "APPROVED" 
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-500/20" 
                          : o.status === "PENDING"
                          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-500/20"
                          : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-500/20"
                      )}>
                        {o.status === "APPROVED" ? "Đã kích hoạt" : o.status === "PENDING" ? "Chờ thanh toán" : "Từ chối"}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 text-slate-400 text-[10px]">
                      {format(new Date(o.createdAt), "dd/MM/yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CAM KẾT & HỖ TRỢ KỸ THUẬT 24/7 ── */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
            <PhoneCall size={20} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Cần hỗ trợ chuyển khoản, kích hoạt hoặc hướng dẫn sử dụng?
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Đội ngũ kỹ thuật hỗ trợ trực tiếp 24/7 qua Hotline / Zalo CSKH:{" "}
              <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="font-black text-emerald-600 dark:text-emerald-400 underline">
                0855550813
              </a>
            </p>
          </div>
        </div>

        <a
          href="https://zalo.me/0855550813"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-black shrink-0 flex items-center gap-2 transition-all active:scale-95"
        >
          <PhoneCall size={14} />
          <span>Liên hệ CSKH 0855550813</span>
        </a>
      </div>

    </div>
  );
}
