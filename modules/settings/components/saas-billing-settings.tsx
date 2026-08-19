"use client";

import React, { useState, useEffect } from "react";
import { SettingsCard } from "./settings-card";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  HelpCircle, 
  Copy, 
  Loader2, 
  History, 
  Check, 
  Info,
  QrCode
} from "lucide-react";
import { 
  getLakeSubscriptionDetails, 
  createSubscriptionOrder, 
  getMySubscriptionOrders 
} from "@/actions/subscription-actions";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

interface SubscriptionDetails {
  plan: string;
  status: string;
  expiresAt: string | null;
  isExpired: boolean;
  limits: {
    name: string;
    maxHuts: number;
    maxStaff: number;
    maxCustomers: number;
    offlineMode: boolean;
  };
  usage: {
    huts: number;
    staff: number;
    customers: number;
  };
}

export function SaasBillingSettings() {
  const [loading, setLoading] = useState(true);
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">("BASIC");
  const [duration, setDuration] = useState<number>(6); // mặc định 6 tháng
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

  // Tính tiền & giảm giá (6 tháng giảm 10%, 12 tháng giảm 20%)
  const getPricingInfo = (plan: "BASIC" | "PREMIUM", months: number) => {
    const basePrice = plan === "BASIC" ? 299000 : 599000;
    const rawTotal = basePrice * months;
    let discount = 0;
    
    if (months === 6) discount = 0.1; // 10%
    if (months === 12) discount = 0.2; // 20%
    
    const finalTotal = Math.round(rawTotal * (1 - discount));
    return {
      pricePerMonth: basePrice,
      rawTotal,
      discountPercent: discount * 100,
      finalTotal,
    };
  };

  const pricing = getPricingInfo(selectedPlan, duration);

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
        description="Lựa chọn các gói dịch vụ phù hợp với mô hình kinh doanh của bạn."
        icon={CreditCard}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chọn gói & thời gian (Left 7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gói cước */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedPlan("BASIC")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left space-y-3 transition-all relative overflow-hidden",
                  selectedPlan === "BASIC" 
                    ? "border-primary bg-primary/5 text-foreground" 
                    : "border-white/5 bg-accent/20 text-muted-foreground"
                )}
              >
                <h4 className="text-sm font-black uppercase text-primary">BASIC</h4>
                <p className="text-xl font-black text-foreground">299.000đ<span className="text-xs font-normal text-muted-foreground">/tháng</span></p>
                <ul className="text-[10px] space-y-1.5 font-bold pt-2 border-t border-white/5">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Tối đa 15 chòi câu</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Tối đa 5 nhân viên</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Tối đa 300 khách hàng</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Đồng bộ offline</li>
                </ul>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("PREMIUM")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left space-y-3 transition-all relative overflow-hidden",
                  selectedPlan === "PREMIUM" 
                    ? "border-primary bg-primary/5 text-foreground" 
                    : "border-white/5 bg-accent/20 text-muted-foreground"
                )}
              >
                <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">Phổ biến</div>
                <h4 className="text-sm font-black uppercase text-primary">PREMIUM</h4>
                <p className="text-xl font-black text-foreground">599.000đ<span className="text-xs font-normal text-muted-foreground">/tháng</span></p>
                <ul className="text-[10px] space-y-1.5 font-bold pt-2 border-t border-white/5">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Không giới hạn chòi</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Không giới hạn nhân viên</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Không giới hạn khách</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Ưu tiên cập nhật</li>
                </ul>
              </button>
            </div>

            {/* Thời gian */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời gian đăng ký</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={cn(
                      "h-14 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border",
                      duration === m 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-accent/20 border-white/5 hover:border-white/20 text-foreground"
                    )}
                  >
                    {m} Tháng
                    {m === 6 && <span className="block text-[8px] text-white/80 font-black mt-0.5">-10%</span>}
                    {m === 12 && <span className="block text-[8px] text-white/80 font-black mt-0.5">-20%</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hóa đơn & Button thanh toán (Right 5 Columns) */}
          <div className="lg:col-span-5">
            <div className="bg-accent/10 border border-white/5 rounded-3xl p-6 space-y-6">
              <h4 className="font-black text-sm uppercase tracking-wider border-b border-white/5 pb-3">Chi tiết thanh toán</h4>
              
              <div className="space-y-3 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>Giá gói:</span>
                  <span className="text-foreground">{pricing.pricePerMonth.toLocaleString()}đ / tháng</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian:</span>
                  <span className="text-foreground">{duration} tháng</span>
                </div>
                {pricing.discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Khuyến mãi:</span>
                    <span>-{pricing.discountPercent}%</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/5 pt-4 text-sm font-black text-foreground">
                  <span className="uppercase tracking-wider">Tổng thanh toán:</span>
                  <span className="text-emerald-500 text-lg font-black">{pricing.finalTotal.toLocaleString()}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={submitting}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                Gửi yêu cầu nâng cấp
              </button>
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
              Thanh Toán Qua Chuyển Khoản
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
      <SettingsCard
        title="Lịch sử yêu cầu nâng cấp"
        description="Theo dõi trạng thái các đơn hàng gia hạn dịch vụ của bạn."
        icon={History}
      >
        <div className="overflow-x-auto no-scrollbar pt-2">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-medium uppercase text-[10px] tracking-widest bg-accent/10 rounded-2xl border border-dashed border-white/5">
              Chưa có giao dịch nâng cấp nào được thực hiện
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="pb-4 pl-4">Thời gian</th>
                  <th className="pb-4">Mã đơn hàng</th>
                  <th className="pb-4">Gói cước</th>
                  <th className="pb-4 text-center">Thời gian</th>
                  <th className="pb-4 text-right">Tổng tiền</th>
                  <th className="pb-4 text-center">Trạng thái</th>
                  <th className="pb-4 pr-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 text-xs font-semibold hover:bg-white/5 transition-all">
                    <td className="py-4 pl-4 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-4 font-black">
                      #{o.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 text-primary font-black uppercase">
                      {o.plan}
                    </td>
                    <td className="py-4 text-center font-bold">
                      {o.durationMonths} tháng
                    </td>
                    <td className="py-4 text-right font-black text-emerald-500">
                      {o.amount.toLocaleString()}đ
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                        o.status === "APPROVED" && "bg-emerald-500/15 text-emerald-400",
                        o.status === "PENDING" && "bg-amber-500/15 text-amber-400",
                        o.status === "REJECTED" && "bg-red-500/15 text-red-400"
                      )}>
                        {o.status === "APPROVED" && "Đã duyệt"}
                        {o.status === "PENDING" && "Chờ duyệt"}
                        {o.status === "REJECTED" && "Từ chối"}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground max-w-[150px] truncate pr-4">
                      {o.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
