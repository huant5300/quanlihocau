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
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
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
    if (plan.price === 0) return;
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <CreditCard className="text-primary" /> Quản Lý Gói Dịch Vụ & Bản Quyền
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gia hạn và nâng cấp tính năng cho hồ câu: <span className="text-primary font-bold">{lakeData?.name}</span>
          </p>
        </div>

        {/* Trạng thái hiện tại */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${
          isExpired 
            ? "bg-red-500/10 border-red-500/20 text-red-400" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        }`}>
          {isExpired ? <AlertTriangle size={20} /> : <Clock size={20} />}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider">Thời hạn sử dụng</div>
            <div className="text-sm font-black">
              {isExpired ? "Hết hạn sử dụng" : `Còn lại ${daysRemaining} ngày`}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách các gói cước */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = lakeData?.subscriptionPlan === plan.id;
          const isHot = plan.id === "GOLD";

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              className={`relative bg-slate-900/60 border rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl transition-all shadow-xl ${
                isHot
                  ? "border-primary shadow-primary/10 ring-1 ring-primary/50"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {isHot && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles size={12} /> Khuyên dùng - Tiết kiệm nhất
                </div>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Thời hạn {plan.durationDays} ngày</p>
                  </div>
                  {isCurrent && (
                    <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Đang dùng
                    </span>
                  )}
                </div>

                <div className="mt-6 mb-6">
                  <span className="text-3xl font-black text-white">
                    {plan.price === 0 ? "Miễn Phí" : `${plan.price.toLocaleString("vi-VN")} đ`}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-slate-400"> / chu kỳ</span>}
                </div>

                {/* Danh sách tính năng */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={plan.price === 0}
                className={`w-full mt-8 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  plan.price === 0
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : isHot
                    ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                {plan.price === 0 ? "Gói Mặc Định" : "Nâng Cấp / Gia Hạn"}
                {plan.price > 0 && <ArrowRight size={16} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Modal / Khung hiển thị thanh toán VietQR */}
      <AnimatePresence>
        {selectedPlan && qrData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-900 border border-primary/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* QR Code */}
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-xl shrink-0">
                <img 
                  src={qrData.qrUrl} 
                  alt="VietQR Payment" 
                  className="w-56 h-56 object-contain rounded-lg"
                />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 mt-2">
                  <QrCode size={14} className="text-primary" /> Quét mã bằng App Ngân Hàng bất kỳ
                </div>
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="flex-1 space-y-4 text-left w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400" /> Xác Nhận Thanh Toán Gói
                  </h3>
                  <button 
                    onClick={() => { setSelectedPlan(null); setQrData(null); }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Đóng
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Vui lòng mở ứng dụng ngân hàng và quét mã QR ở bên cạnh để tự động điền đúng số tiền và nội dung chuyển khoản.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ngân hàng</div>
                    <div className="text-sm font-black text-white mt-0.5">{qrData.paymentInfo.bankName || qrData.paymentInfo.bankId}</div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Số tài khoản</div>
                      <div className="text-sm font-black text-white mt-0.5">{qrData.paymentInfo.accountNo}</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(qrData.paymentInfo.accountNo, "Số tài khoản")}
                      className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Chủ tài khoản</div>
                    <div className="text-sm font-black text-white mt-0.5">{qrData.paymentInfo.accountName}</div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Số tiền thanh toán</div>
                    <div className="text-sm font-black text-primary mt-0.5">
                      {qrData.plan.price.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                </div>

                {/* Nội dung bắt buộc */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      Nội dung chuyển khoản (Bắt buộc giữ nguyên)
                    </div>
                    <div className="text-sm font-mono font-black text-white mt-1">{qrData.transferContent}</div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(qrData.transferContent, "Nội dung chuyển khoản")}
                    className="p-2 text-amber-400 hover:text-white bg-amber-500/20 rounded-xl"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
