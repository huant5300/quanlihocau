"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileDown, 
  Printer, 
  RefreshCw, 
  User, 
  X,
  CreditCard,
  Plus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getInvoicesAction, getInvoiceStatsAction, payInvoiceDebtAction } from "@/actions/invoice-actions";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { printerService } from "@/services/printer/printer-service";
import { PaymentMethod } from "@prisma/client";
import { exportToExcel } from "@/utils/export-excel";
import { exportToPDF } from "@/utils/export-pdf";

interface InvoicesClientProps {
  initialInvoices: any[];
  initialStats: {
    revenue: number;
    unpaid: number;
    paid: number;
    debt: number;
  };
}

export function InvoicesClient({ initialInvoices, initialStats }: InvoicesClientProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [debtPaymentInv, setDebtPaymentInv] = useState<any | null>(null);
  const [debtAmount, setDebtAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [debtSubmitting, setDebtSubmitting] = useState(false);

  // 1. Fetch Invoices via TanStack Query
  const { 
    data: invoices = initialInvoices, 
    refetch: refetchInvoices, 
    isLoading: isInvoicesLoading 
  } = useQuery({
    queryKey: ["invoices-list", query, statusFilter, startDate, endDate],
    queryFn: async () => {
      const res = await getInvoicesAction({
        query,
        status: statusFilter,
        startDate,
        endDate
      });
      if (res.success) return res.data || [];
      throw new Error(res.error || "Failed to load invoices");
    },
    initialData: initialInvoices,
    staleTime: 5000
  });

  // 2. Fetch Invoice Stats
  const { 
    data: stats = initialStats, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ["invoices-stats", startDate, endDate],
    queryFn: async () => {
      const res = await getInvoiceStatsAction({ startDate, endDate });
      if (res.success) return res.data;
      throw new Error(res.error || "Failed to load stats");
    },
    initialData: initialStats,
    staleTime: 5000
  });

  const handleRefresh = () => {
    refetchInvoices();
    refetchStats();
    toast.success("Đã làm mới dữ liệu hóa đơn");
  };

  // Xuất file Excel
  const handleExportExcel = () => {
    if (invoices.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const data = invoices.map((inv: any, idx: number) => ({
      "STT": idx + 1,
      "Mã hóa đơn": inv.invoiceNumber,
      "Khách hàng": inv.customerName,
      "Số điện thoại": inv.customerPhone,
      "Vị trí": inv.areaName,
      "Thời gian": new Date(inv.createdAt).toLocaleString("vi-VN"),
      "Tổng tiền (VNĐ)": Number(inv.totalAmount),
      "Đã thanh toán (VNĐ)": Number(inv.totalPaid),
      "Còn nợ (VNĐ)": Number(inv.remainingDebt),
      "Trạng thái": inv.status === "PAID" ? "Đã thanh toán" : inv.status === "PARTIAL" ? "Còn nợ" : "Chưa thanh toán",
      "Phương thức": inv.paymentMethod
    }));

    exportToExcel(data, `danh_sach_don_hang_${new Date().toISOString().substring(0, 10)}`);
    toast.success("Đã xuất file Excel thành công!");
  };

  // Xuất file PDF
  const handleExportPDF = () => {
    if (invoices.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const headers = ["STT", "Mã hóa đơn", "Khách hàng", "SĐT", "Vị trí", "Thời gian", "Tổng tiền", "Còn nợ", "Trạng thái"];
    const rows = invoices.map((inv: any, idx: number) => [
      idx + 1,
      inv.invoiceNumber,
      inv.customerName,
      inv.customerPhone,
      inv.areaName,
      new Date(inv.createdAt).toLocaleString("vi-VN"),
      Number(inv.totalAmount).toLocaleString() + "đ",
      Number(inv.remainingDebt).toLocaleString() + "đ",
      inv.status === "PAID" ? "Đã thanh toán" : inv.status === "PARTIAL" ? "Còn nợ" : "Chưa thanh toán"
    ]);

    exportToPDF({
      title: "Danh Sách Hóa Đơn",
      headers,
      rows,
      filename: `danh_sach_don_hang_${new Date().toISOString().substring(0, 10)}`
    });
    toast.success("Đã xuất file PDF thành công!");
  };

  // Thu nợ hóa đơn
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
        note: "Thu nợ công nợ tại trang Quản lý đơn hàng"
      });

      if (res.success) {
        toast.success("Đã thu nợ công nợ hóa đơn thành công!");
        setDebtPaymentInv(null);
        refetchInvoices();
        refetchStats();
      } else {
        toast.error(res.error || "Giao dịch thu nợ thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối hệ thống");
    } finally {
      setDebtSubmitting(false);
    }
  };

  // In lại hóa đơn qua máy in Bluetooth
  const handlePrintAgain = async (inv: any) => {
    toast.info("Đang kết nối máy in để in lại hóa đơn...");
    try {
      // Vì data format của in hóa đơn cần session data chi tiết,
      // ta map lại format tương thích
      const printData = {
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerPhone: inv.customerPhone,
        areaName: inv.areaName,
        startTime: inv.startTime,
        endTime: inv.endTime,
        totalAmount: inv.totalAmount,
        totalPaid: inv.totalPaid,
        remainingDebt: inv.remainingDebt,
        subtotal: inv.subtotal,
        discount: inv.discount,
        tax: inv.tax,
        items: [
          { name: `Giờ câu (${inv.areaName})`, quantity: 1, price: inv.subtotal }
        ]
      };
      
      const success = await printerService.printBill(printData as any);
      if (success) {
        toast.success("Đã gửi lệnh in thành công!");
      } else {
        toast.error("In thất bại. Hãy chắc chắn máy in Bluetooth đã được bật và kết nối.");
      }
    } catch (err) {
      toast.error("Lỗi khi gửi lệnh in");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Khối Thống kê Doanh thu (4 thẻ) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="p-5 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu tổng</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            {stats.revenue.toLocaleString()}đ
          </h3>
        </div>

        {/* Đơn nháp (Chờ thu) */}
        <div className="p-5 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Đơn chưa trả (Chờ thu)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            {stats.unpaid.toLocaleString()}đ
          </h3>
        </div>

        {/* Đã thanh toán */}
        <div className="p-5 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Thực thu (Đã trả)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            {stats.paid.toLocaleString()}đ
          </h3>
        </div>

        {/* Còn nợ */}
        <div className="p-5 rounded-[2rem] bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Còn nợ công nợ</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle size={16} />
            </div>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            {stats.debt.toLocaleString()}đ
          </h3>
        </div>
      </div>

      {/* 2. Bộ Lọc & Tìm kiếm */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Ô tìm kiếm */}
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Tìm kiếm theo mã đơn, SĐT khách..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-card rounded-2xl border border-white/5 outline-none font-bold text-xs focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Chọn ngày bắt đầu */}
          <div className="relative flex-1 sm:w-44">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 pl-11 pr-3 bg-card rounded-2xl border border-white/5 outline-none font-bold text-xs text-white"
            />
          </div>

          {/* Chọn ngày kết thúc */}
          <div className="relative flex-1 sm:w-44">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-12 pl-11 pr-3 bg-card rounded-2xl border border-white/5 outline-none font-bold text-xs text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Lọc trạng thái hóa đơn */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 bg-card rounded-2xl border border-white/5 outline-none font-black text-xs uppercase tracking-wider text-white flex-1 sm:flex-initial"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="PARTIAL">Còn nợ</option>
            <option value="UNPAID">Chưa thanh toán</option>
          </select>

          {/* Nút làm mới */}
          <button 
            onClick={handleRefresh}
            className="w-12 h-12 bg-card border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all text-muted-foreground hover:text-white shrink-0"
          >
            <RefreshCw size={18} />
          </button>

          {/* Nút xuất Excel */}
          <button
            onClick={handleExportExcel}
            className="h-12 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
          >
            <FileDown size={16} />
            Excel
          </button>

          {/* Nút xuất PDF */}
          <button
            onClick={handleExportPDF}
            className="h-12 px-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all shrink-0"
          >
            <FileDown size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* 3. Bảng Danh Sách Đơn Hàng */}
      <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto no-scrollbar">
          {isInvoicesLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-semibold uppercase text-xs tracking-widest bg-accent/5">
              Không tìm thấy hóa đơn nào phù hợp với bộ lọc
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-bold">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/[0.01]">
                  <th className="py-5 pl-8">STT</th>
                  <th className="py-5">Mã đơn hàng</th>
                  <th className="py-5">Hội viên / Khách hàng</th>
                  <th className="py-5">Vị trí</th>
                  <th className="py-5">Thời gian xuất</th>
                  <th className="py-5 text-right">Tổng tiền</th>
                  <th className="py-5 text-right">Đã thanh toán</th>
                  <th className="py-5 text-right">Số tiền còn nợ</th>
                  <th className="py-5">Phương thức</th>
                  <th className="py-5 text-center">Trạng thái</th>
                  <th className="py-5 pr-8 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-all">
                    <td className="py-4 pl-8 text-muted-foreground font-semibold">{idx + 1}</td>
                    <td className="py-4">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="font-black text-primary hover:underline uppercase tracking-wide text-xs"
                      >
                        #{inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="py-4">
                      {inv.customerId ? (
                        <Link 
                          href={`/dashboard/customers/${inv.customerId}`}
                          className="font-black text-white hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <User size={13} className="text-primary/70 shrink-0" />
                          {inv.customerName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground italic font-semibold">{inv.customerName}</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide text-white">
                        {inv.areaName}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-4 text-right font-black text-white">
                      {inv.totalAmount.toLocaleString()}đ
                    </td>
                    <td className="py-4 text-right font-bold text-emerald-500">
                      {inv.totalPaid.toLocaleString()}đ
                    </td>
                    <td className={cn(
                      "py-4 text-right font-black",
                      inv.remainingDebt > 0 ? "text-red-500 text-sm" : "text-muted-foreground"
                    )}>
                      {inv.remainingDebt.toLocaleString()}đ
                    </td>
                    <td className="py-4 text-xs font-black uppercase tracking-wide text-muted-foreground">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                        inv.status === "PAID" && "bg-emerald-500/15 text-emerald-400",
                        inv.status === "PARTIAL" && "bg-amber-500/15 text-amber-400",
                        inv.status === "UNPAID" && "bg-red-500/15 text-red-400",
                        inv.status === "VOID" && "bg-slate-500/15 text-slate-400"
                      )}>
                        {inv.status === "PAID" && "Đã thanh toán"}
                        {inv.status === "PARTIAL" && "Còn nợ"}
                        {inv.status === "UNPAID" && "Chưa thanh toán"}
                        {inv.status === "VOID" && "Đã hủy"}
                      </span>
                    </td>
                    <td className="py-4 pr-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Button in lại */}
                        <button
                          onClick={() => handlePrintAgain(inv)}
                          title="In lại hóa đơn"
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all"
                        >
                          <Printer size={14} />
                        </button>
                        
                        {/* Button thu nợ nhanh */}
                        {inv.remainingDebt > 0 && (
                          <button
                            onClick={() => {
                              setDebtPaymentInv(inv);
                              setDebtAmount(inv.remainingDebt);
                            }}
                            className="px-2.5 h-8 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
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

      {/* 4. Modal Chi tiết Hóa đơn (Thermal Print preview) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center border border-white/5"
            >
              <X size={14} />
            </button>

            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">
              Xem chi tiết hóa đơn
            </h3>

            {/* Hóa đơn nhiệt mẫu 58mm */}
            <div className="bg-white text-black p-6 rounded-2xl shadow-inner font-mono text-[11px] leading-relaxed max-w-[280px] mx-auto border-2 border-slate-200">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-[13px] uppercase">HỒ CÂU DỊCH VỤ</h4>
                <p>Quản lý chuyên nghiệp</p>
                <p>Số ĐT: 0963.529.999</p>
                <div className="border-b border-dashed border-black/30 my-2" />
              </div>

              <div className="space-y-1">
                <p><strong>Mã hóa đơn:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong>Khách hàng:</strong> {selectedInvoice.customerName}</p>
                <p><strong>Số ĐT:</strong> {selectedInvoice.customerPhone || "Khách lẻ"}</p>
                <p><strong>Vị trí:</strong> {selectedInvoice.areaName}</p>
                <p><strong>Thời gian xuất:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN")}</p>
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
                    <td className="py-1">Giờ câu ({selectedInvoice.areaName})</td>
                    <td className="py-1 text-center">1</td>
                    <td className="py-1 text-right">{selectedInvoice.subtotal.toLocaleString()}đ</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-dashed border-black/30 my-2 pt-2 space-y-1 text-right">
                <p><strong>Thành tiền:</strong> {selectedInvoice.subtotal.toLocaleString()}đ</p>
                {selectedInvoice.discount > 0 && <p><strong>Giảm giá:</strong> -{selectedInvoice.discount.toLocaleString()}đ</p>}
                <p className="text-[13px] font-bold"><strong>Tổng cộng:</strong> {selectedInvoice.totalAmount.toLocaleString()}đ</p>
                <p><strong>Đã thanh toán:</strong> {selectedInvoice.totalPaid.toLocaleString()}đ</p>
                {selectedInvoice.remainingDebt > 0 && (
                  <p className="text-red-600 font-bold"><strong>CÒN NỢ:</strong> {selectedInvoice.remainingDebt.toLocaleString()}đ</p>
                )}
              </div>

              <div className="border-b border-dashed border-black/30 my-2" />
              <div className="text-center font-bold">
                <p>CẢM ƠN QUÝ KHÁCH</p>
                <p>HẸN GẶP LẠI!</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handlePrintAgain(selectedInvoice)}
                className="flex-1 h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
              >
                <Printer size={16} />
                In lại hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Thu Nợ Công Nợ */}
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
                Thu nợ công nợ
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                Ghi nhận số tiền khách trả cho hóa đơn #{debtPaymentInv.invoiceNumber}
              </p>
            </div>

            <form onSubmit={handlePayDebtSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hội viên thanh toán</label>
                <div className="w-full h-11 px-4 bg-accent/20 rounded-xl flex items-center font-bold text-sm text-white border border-white/5">
                  {debtPaymentInv.customerName} ({debtPaymentInv.customerPhone || "Khách lẻ"})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tổng tiền hóa đơn</label>
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
                  placeholder="Nhập số tiền thu nợ"
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
