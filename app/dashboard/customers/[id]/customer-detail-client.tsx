"use client";

import React, { useState } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CreditCard, 
  History, 
  DollarSign, 
  Award, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  Loader2,
  Printer
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCustomerDetailsAction } from "@/actions/customer-actions";
import { payInvoiceDebtAction } from "@/actions/invoice-actions";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import { LoyaltyBadge } from "@/components/shared/loyalty-badge";
import { printerService } from "@/services/printer/printer-service";
import { PaymentMethod } from "@prisma/client";

interface CustomerDetailClientProps {
  customer: any;
}

export function CustomerDetailClient({ customer: initialCustomer }: CustomerDetailClientProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [debtPaymentInv, setDebtPaymentInv] = useState<any | null>(null);
  const [debtAmount, setDebtAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [debtSubmitting, setDebtSubmitting] = useState(false);

  // Fetch updated customer details
  const { refetch: refetchCustomer } = useQuery({
    queryKey: ["customer-details", customer.id],
    queryFn: async () => {
      const res = await getCustomerDetailsAction(customer.id);
      if (res.success && res.data) {
        setCustomer(res.data);
        return res.data;
      }
      throw new Error(res.error || "Failed to load details");
    },
    initialData: initialCustomer,
    enabled: false
  });

  const handlePayDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPaymentInv) return;

    if (debtAmount <= 0 || debtAmount > debtPaymentInv.remainingDebt) {
      toast.error("Số tiền thu nợ không hợp lệ");
      return;
    }

    setDebtSubmitting(true);
    try {
      const res = await payInvoiceDebtAction({
        invoiceId: debtPaymentInv.id,
        amount: debtAmount,
        paymentMethod,
        note: `Thu nợ khách hàng ${customer.fullName}`
      });

      if (res.success) {
        toast.success("Đã thu nợ thành công!");
        setDebtPaymentInv(null);
        refetchCustomer();
      } else {
        toast.error(res.error || "Giao dịch thu nợ thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối hệ thống");
    } finally {
      setDebtSubmitting(false);
    }
  };

  const handlePrintAgain = async (inv: any) => {
    toast.info("Đang kết nối máy in...");
    try {
      const printData = {
        invoiceNumber: inv.invoiceNumber,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        areaName: inv.areaName || "Bán lẻ",
        startTime: inv.startTime,
        endTime: inv.endTime,
        totalAmount: inv.totalAmount,
        totalPaid: inv.totalPaid,
        remainingDebt: inv.remainingDebt,
        subtotal: inv.totalAmount, // Map subtotal đơn giản
        discount: 0,
        tax: 0,
        items: [
          { name: `Dịch vụ câu & hàng hóa`, quantity: 1, price: inv.totalAmount }
        ]
      };
      
      const success = await printerService.printBill(printData as any);
      if (success) {
        toast.success("Đã in thành công!");
      } else {
        toast.error("Không in được. Vui lòng kết nối máy in Bluetooth.");
      }
    } catch (err) {
      toast.error("Lỗi gửi lệnh in");
    }
  };

  return (
    <div className="space-y-8">
      {/* Nút Back */}
      <div>
        <Link 
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>

      {/* Grid: 2 cột - Trái: Thông tin + Stats, Phải: Lịch sử */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cột trái (4 cột) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card profile */}
          <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-black text-3xl shadow-lg border border-white/10">
                {customer.fullName[0].toUpperCase()}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{customer.fullName}</h3>
                <div className="flex justify-center gap-2 mt-2">
                  <LoyaltyBadge tier={customer.loyaltyTier} points={customer.loyaltyPoints} showPoints={true} />
                  {customer.isVip && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">VIP</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 space-y-4 text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-primary shrink-0" />
                <span>Số ĐT: <strong className="text-white ml-1">{customer.phone}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>Địa chỉ: <strong className="text-white ml-1">{customer.address}</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <Award size={14} className="text-primary shrink-0 mt-0.5" />
                <span>Ghi chú: <p className="text-white mt-1 italic leading-relaxed">{customer.notes}</p></span>
              </div>
            </div>
          </div>

          {/* Cards stats */}
          <div className="space-y-4">
            {/* Tổng chi */}
            <div className="bg-accent/10 border border-white/5 rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tổng tiền chi tiêu</p>
                <h4 className="text-lg font-black text-white mt-1">{customer.totalSpent.toLocaleString()}đ</h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>

            {/* Công nợ */}
            <div className={cn(
              "border rounded-3xl p-5 flex items-center justify-between transition-all",
              customer.debtBalance > 0 ? "bg-red-500/5 border-red-500/20" : "bg-accent/10 border-white/5"
            )}>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Dư nợ công nợ</p>
                <h4 className={cn(
                  "text-lg font-black mt-1",
                  customer.debtBalance > 0 ? "text-red-500" : "text-white"
                )}>{customer.debtBalance.toLocaleString()}đ</h4>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                customer.debtBalance > 0 ? "bg-red-500/10 text-red-500" : "bg-slate-500/10 text-muted-foreground"
              )}>
                <CreditCard size={18} />
              </div>
            </div>

            {/* Số lần câu */}
            <div className="bg-accent/10 border border-white/5 rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lượt ghé hồ câu</p>
                <h4 className="text-lg font-black text-white mt-1">{customer.visitCount} lần câu</h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <History size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải (8 cột) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lịch sử hóa đơn */}
          <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              Danh sách Hóa đơn phát sinh
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              {customer.invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic text-xs bg-accent/5 rounded-2xl">
                  Chưa có hóa đơn phát sinh cho hội viên này
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs font-bold">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="pb-3">Mã đơn</th>
                      <th className="pb-3">Ngày tạo</th>
                      <th className="pb-3 text-right">Tổng tiền</th>
                      <th className="pb-3 text-right">Đã thanh toán</th>
                      <th className="pb-3 text-right">Còn nợ</th>
                      <th className="pb-3 text-center">Trạng thái</th>
                      <th className="pb-3 text-center">In lại / Thu nợ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.invoices.map((inv: any) => (
                      <tr key={inv.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors font-semibold">
                        <td className="py-4">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="font-black text-primary hover:underline uppercase text-xs"
                          >
                            #{inv.invoiceNumber}
                          </button>
                        </td>
                        <td className="py-4 text-muted-foreground text-xs">
                          {new Date(inv.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 text-right font-black text-white">
                          {inv.totalAmount.toLocaleString()}đ
                        </td>
                        <td className="py-4 text-right text-emerald-500 font-bold">
                          {inv.totalPaid.toLocaleString()}đ
                        </td>
                        <td className={cn(
                          "py-4 text-right font-black",
                          inv.remainingDebt > 0 ? "text-red-500 text-sm" : "text-muted-foreground"
                        )}>
                          {inv.remainingDebt.toLocaleString()}đ
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                            inv.status === "PAID" && "bg-emerald-500/15 text-emerald-400",
                            inv.status === "PARTIAL" && "bg-amber-500/15 text-amber-400",
                            inv.status === "UNPAID" && "bg-red-500/15 text-red-400"
                          )}>
                            {inv.status === "PAID" && "Đã trả"}
                            {inv.status === "PARTIAL" && "Còn nợ"}
                            {inv.status === "UNPAID" && "Chưa trả"}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePrintAgain(inv)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
                            >
                              <Printer size={12} />
                            </button>
                            {inv.remainingDebt > 0 && (
                              <button
                                onClick={() => {
                                  setDebtPaymentInv(inv);
                                  setDebtAmount(inv.remainingDebt);
                                }}
                                className="px-2 h-7 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider"
                              >
                                Thu nợ
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Lịch sử ca câu */}
          <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <History size={16} className="text-primary" />
              Lịch sử các lượt/ca câu đã câu
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              {customer.sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic text-xs bg-accent/5 rounded-2xl">
                  Chưa có lịch sử lượt câu nào
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs font-bold">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="pb-3">Vị trí / Chòi</th>
                      <th className="pb-3">Gói ca</th>
                      <th className="pb-3">Giờ bắt đầu</th>
                      <th className="pb-3">Giờ kết thúc</th>
                      <th className="pb-3 text-center">Số giờ</th>
                      <th className="pb-3 text-right">Thành tiền</th>
                      <th className="pb-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.sessions.map((s: any) => (
                      <tr key={s.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors font-semibold">
                        <td className="py-4">
                          <span className="bg-primary/10 text-primary border border-primary/15 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">
                            {s.areaName}
                          </span>
                        </td>
                        <td className="py-4 text-white">
                          {s.packageName || "Giờ lẻ / ca lẻ"}
                        </td>
                        <td className="py-4 text-muted-foreground text-xs">
                          {new Date(s.startTime).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 text-muted-foreground text-xs">
                          {s.endTime ? new Date(s.endTime).toLocaleString("vi-VN") : "Chưa kết thúc"}
                        </td>
                        <td className="py-4 text-center font-bold">
                          {s.totalHours.toFixed(1)}h
                        </td>
                        <td className="py-4 text-right font-black text-white">
                          {s.amount.toLocaleString()}đ
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                            s.status === "COMPLETED" && "bg-emerald-500/15 text-emerald-400",
                            s.status === "ACTIVE" && "bg-blue-500/15 text-blue-400 animate-pulse",
                            s.status === "CANCELLED" && "bg-slate-500/15 text-slate-400"
                          )}>
                            {s.status === "COMPLETED" && "Đã xong"}
                            {s.status === "ACTIVE" && "Đang câu"}
                            {s.status === "CANCELLED" && "Đã hủy"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Chi tiết hóa đơn */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center border border-white/5"
            >
              <X size={14} />
            </button>

            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">
              Xem chi tiết hóa đơn
            </h3>

            <div className="bg-white text-black p-6 rounded-2xl shadow-inner font-mono text-[11px] leading-relaxed max-w-[280px] mx-auto border-2 border-slate-200">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-[13px] uppercase">HỒ CÂU DỊCH VỤ</h4>
                <p>Chi tiết hóa đơn hội viên</p>
                <div className="border-b border-dashed border-black/30 my-2" />
              </div>

              <div className="space-y-1">
                <p><strong>Mã đơn:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong>Khách hàng:</strong> {customer.fullName}</p>
                <p><strong>Số ĐT:</strong> {customer.phone}</p>
                <p><strong>Ngày tạo:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN")}</p>
                <div className="border-b border-dashed border-black/30 my-2" />
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-dashed border-black/30 font-bold">
                    <th className="pb-1">Dịch vụ</th>
                    <th className="pb-1 text-center">SL</th>
                    <th className="pb-1 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">Lượt câu chi tiết</td>
                    <td className="py-1 text-center">1</td>
                    <td className="py-1 text-right">{selectedInvoice.totalAmount.toLocaleString()}đ</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-dashed border-black/30 my-2 pt-2 space-y-1 text-right">
                <p className="text-[12px] font-bold"><strong>Tổng tiền:</strong> {selectedInvoice.totalAmount.toLocaleString()}đ</p>
                <p><strong>Đã thanh toán:</strong> {selectedInvoice.totalPaid.toLocaleString()}đ</p>
                {selectedInvoice.remainingDebt > 0 && (
                  <p className="text-red-600 font-bold"><strong>Còn nợ:</strong> {selectedInvoice.remainingDebt.toLocaleString()}đ</p>
                )}
              </div>
            </div>

            <button
              onClick={() => handlePrintAgain(selectedInvoice)}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={14} />
              In lại hóa đơn này
            </button>
          </div>
        </div>
      )}

      {/* Modal Thu Nợ Công Nợ */}
      {debtPaymentInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setDebtPaymentInv(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center border border-white/5"
            >
              <X size={14} />
            </button>

            <div>
              <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <CreditCard className="text-emerald-500" size={20} />
                Thu nợ công nợ hóa đơn
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                Ghi nhận số tiền khách trả cho hóa đơn #{debtPaymentInv.invoiceNumber}
              </p>
            </div>

            <form onSubmit={handlePayDebtSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tổng nợ hóa đơn</label>
                  <div className="w-full h-11 px-4 bg-accent/20 rounded-xl flex items-center font-bold text-sm text-white border border-white/5">
                    {debtPaymentInv.totalAmount.toLocaleString()}đ
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Còn nợ lại</label>
                  <div className="w-full h-11 px-4 bg-red-500/10 rounded-xl flex items-center font-black text-sm text-red-500 border border-red-500/20">
                    {debtPaymentInv.remainingDebt.toLocaleString()}đ
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số tiền khách trả đợt này *</label>
                <input 
                  type="number"
                  required
                  min="1"
                  max={debtPaymentInv.remainingDebt}
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(Number(e.target.value))}
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-bold text-lg text-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phương thức thanh toán</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={cn(
                      "h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border",
                      paymentMethod === "CASH" 
                        ? "bg-primary border-primary text-white" 
                        : "bg-accent/20 border-white/5 text-foreground hover:border-white/20"
                    )}
                  >
                    Tiền mặt
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={cn(
                      "h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border",
                      paymentMethod === "TRANSFER" 
                        ? "bg-primary border-primary text-white" 
                        : "bg-accent/20 border-white/5 text-foreground hover:border-white/20"
                    )}
                  >
                    Chuyển khoản
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDebtPaymentInv(null)}
                  className="h-14 bg-accent/50 hover:bg-accent text-foreground rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={debtSubmitting}
                  className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {debtSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Xác nhận thu nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
