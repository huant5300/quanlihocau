"use client";

import React, { useState, useEffect } from "react";
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
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxLakes: number;
  badge?: string;
  description?: string;
  features: string[];
}

export default function BillingPage() {
  const [lakeData, setLakeData] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State khi bấm nâng cấp
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/billing");
      const data = await res.json();
      if (res.ok) {
        setLakeData(data.lake);
        setDaysRemaining(data.daysRemaining);
        setIsExpired(data.isExpired);
        setPlans(data.plans);
        setPaymentInfo(data.paymentInfo);
      } else {
        toast.error(data.error || "Không thể tải thông tin gói cước");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.price === 0) {
      toast.info("Bạn đang trong chương trình Dùng Thử Miễn Phí 5 Ngày!");
      return;
    }
    setSelectedPlan(plan);
    setIsGeneratingQr(true);
    try {
      const res = await fetch("/api/v1/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrData(data);
      } else {
        toast.error(data.error || "Không thể tạo mã QR thanh toán");
      }
    } catch (error) {
      toast.error("Lỗi tạo giao dịch");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const [isActivating, setIsActivating] = useState<boolean>(false);

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setIsActivating(true);
    try {
      const res = await fetch("/api/v1/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Đã kích hoạt thành công ${selectedPlan.name}! 🎉`);
        setSelectedPlan(null);
        setQrData(null);
        await fetchBillingInfo();
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
    toast.success(`Đã sao chép ${label}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      
      {/* ── BANNER KHUYẾN MÃI THÂN THIỆN ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <Gift size={13} />
            <span>Ưu đãi dùng thử 5 ngày Miễn Phí</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Đồng hành cùng mọi Chủ hồ câu trên toàn quốc
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 font-medium">
            Phần mềm đơn giản, dễ dùng, chỉ cần điện thoại hoặc máy tính là quản lý trọn vẹn từ vào ca, bán mồi, cân cá đến in hóa đơn.
          </p>
        </div>

        {/* Current status pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shrink-0 text-center">
          <div className="text-[11px] font-bold text-emerald-100 uppercase">Trạng thái bản quyền</div>
          <div className="text-lg font-black mt-0.5">
            {isExpired ? "Hết hạn dùng thử" : `Còn lại ${daysRemaining} ngày`}
          </div>
          <div className="text-[10px] text-emerald-200 mt-0.5">
            Hồ: {lakeData?.name || "Hồ câu dịch vụ"}
          </div>
        </div>
      </div>

      {/* ── BẢNG CÁC GÓI CƯỚC ── */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Bảng giá dịch vụ phần mềm
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Chi phí siêu rẻ, minh bạch, kích hoạt tự động qua VietQR 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isCurrent = lakeData?.subscriptionPlan === plan.id;
            const isSilver = plan.id === "SILVER";
            const isGold = plan.id === "GOLD";
            const isTrial = plan.id === "TRIAL";

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={cn(
                  "bg-white dark:bg-zinc-900 rounded-3xl p-6 border flex flex-col justify-between transition-all relative shadow-2xs",
                  isSilver && "border-emerald-500/80 shadow-md ring-2 ring-emerald-500/20",
                  isGold && "border-amber-400 shadow-md ring-2 ring-amber-400/30 bg-gradient-to-b from-amber-500/5 to-transparent",
                  isTrial && "border-slate-200/80 dark:border-zinc-800"
                )}
              >
                {/* Popular / Best value badge */}
                {isSilver && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm">
                    Phổ biến nhất - 1 Hồ Full chức năng
                  </div>
                )}
                {isGold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Crown size={11} /> Chuỗi 5 Hồ câu VIP
                  </div>
                )}

                <div>
                  {/* Plan Name & Price */}
                  <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {plan.price === 0 ? "0 đ" : `${plan.price.toLocaleString()} đ`}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {plan.price === 0 ? "/ 5 ngày" : "/ tháng"}
                      </span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="py-3 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Building2 size={14} />
                    <span>Giới hạn: Mở tối đa {plan.maxLakes} Hồ câu</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 py-3 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                  {isTrial ? (
                    <button
                      disabled
                      className="w-full h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 font-bold text-xs cursor-not-allowed"
                    >
                      Gói trải nghiệm ban đầu
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={cn(
                        "w-full h-11 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
                        isSilver && "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25",
                        isGold && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                      )}
                    >
                      <Zap size={14} />
                      <span>{isCurrent ? "Gia hạn gói này" : "Nâng cấp ngay"}</span>
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL THANH TOÁN VIETQR ── */}
      <AnimatePresence>
        {selectedPlan && qrData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5"
            >
              <div className="text-center space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Thanh toán nâng cấp {selectedPlan.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Quét mã VietQR bằng bất kỳ App Ngân Hàng nào (MB, VCB, Tech, BIDV...)
                </p>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-50 dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700 flex flex-col items-center">
                <div className="bg-white p-2.5 rounded-xl shadow-xs">
                  <img
                    src={qrData.qrUrl}
                    alt="VietQR Payment"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Mã QR động tự điền số tiền và nội dung
                </p>
              </div>

              {/* Payment Details to Copy */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {selectedPlan.price.toLocaleString()} đ
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {qrData.paymentInfo?.bankName}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {qrData.paymentInfo?.accountNo}
                    </span>
                    <button
                      onClick={() => copyToClipboard(qrData.paymentInfo?.accountNo, "Số tài khoản")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-500"
                      title="Sao chép"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {qrData.transferContent}
                    </span>
                    <button
                      onClick={() => copyToClipboard(qrData.transferContent, "Nội dung chuyển khoản")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-500"
                      title="Sao chép"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Realtime Listening Pulse */}
              <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Hệ thống tự động kích hoạt ngay khi nhận tiền chuyển khoản 24/7</span>
              </div>

              {/* Instant Upgrade Confirmation Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={isActivating}
                className={cn(
                  "w-full h-12 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer",
                  selectedPlan.id === "GOLD"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25",
                  isActivating && "opacity-75 cursor-not-allowed"
                )}
              >
                {isActivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Đang kích hoạt {selectedPlan.name}...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Tôi đã chuyển khoản {selectedPlan.price.toLocaleString()}đ — Kích hoạt ngay</span>
                  </>
                )}
              </button>

              {/* CSKH Notice in Modal */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs space-y-1">
                <p className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                  <PhoneCall size={13} />
                  <span>Hỗ trợ chuyển khoản & Kích hoạt:</span>
                </p>
                <p className="text-slate-600 dark:text-zinc-300 text-[11px]">
                  Nếu chuyển khoản có vấn đề gì hoặc cần hỗ trợ gấp, vui lòng liên hệ CSKH / Zalo:{" "}
                  <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="font-extrabold text-emerald-600 underline">
                    0855550813
                  </a>
                </p>
              </div>

              {/* Close & Direct Contact Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    setQrData(null);
                  }}
                  className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs transition-colors"
                >
                  Đóng lại
                </button>
                <a
                  href="https://zalo.me/0855550813"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall size={13} />
                  <span>Zalo CSKH (0855550813)</span>
                </a>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CAM KẾT VÀ HỖ TRỢ ── */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <PhoneCall size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Cần hỗ trợ chuyển khoản, kích hoạt hoặc tư vấn gói cước?
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Đội ngũ kỹ thuật hỗ trợ trực tiếp 24/7 qua Hotline / Zalo CSKH:{" "}
              <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="font-extrabold text-emerald-600 underline">
                0855550813
              </a>
            </p>
          </div>
        </div>

        <a
          href="https://zalo.me/0855550813"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-colors"
        >
          <PhoneCall size={14} />
          <span>Liên hệ CSKH 0855550813</span>
        </a>
      </div>

    </div>
  );
}
