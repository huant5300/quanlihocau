"use client";

import React, { useState, useEffect } from "react";
import { Search, UserPlus, FileDown } from "lucide-react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { createCustomerAction } from "@/actions/customer-actions";
import { toast } from "sonner";
import { exportToExcel } from "@/utils/export-excel";
import { exportToPDF } from "@/utils/export-pdf";
import { cn } from "@/utils/utils";

export function CustomersClient({ initialCustomers = [] }: { initialCustomers?: any[] }) {
  const [customers, setCustomers] = useState<any[]>(initialCustomers || []);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setCustomers(initialCustomers || []);
  }, [initialCustomers]);

  const filteredCustomers = (customers || []).filter((c: any) => {
    if (!c) return false;
    const query = (search || "").toLowerCase().trim();
    if (!query) return true;
    const nameMatch = (c?.fullName || "").toLowerCase().includes(query);
    const phoneMatch = (c?.phone || "").includes(query);
    return nameMatch || phoneMatch;
  });

  const handleAddCustomer = async (formData: FormData) => {
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    
    const result = await createCustomerAction({ fullName, phone });
    if (result.success && result.data) {
      toast.success("Đã thêm hội viên mới thành công");
      setCustomers((prev) => [result.data, ...prev]);
      setIsModalOpen(false);
    } else {
      toast.error(result.error || "Không thể thêm hội viên");
    }
  };

  const handleExportExcel = () => {
    if (!customers || customers.length === 0) return toast.error("Không có dữ liệu để xuất");
    const data = customers.map((c: any, i: number) => ({
      "STT": i + 1,
      "Tên khách hàng": c?.fullName || "Khách câu",
      "SĐT": c?.phone || "--",
      "Số lần câu": c?.visitCount || 0,
      "Tổng chi (VNĐ)": Number(c?.totalSpent || 0),
      "Công nợ (VNĐ)": Number(c?.debtBalance || 0),
      "Hạng": c?.isVip ? "VIP" : c?.loyaltyTier || "BRONZE",
      "Điểm": c?.loyaltyPoints || 0,
    }));
    exportToExcel(data, `danh_sach_khach_hang`);
    toast.success("Xuất Excel thành công");
  };

  const handleExportPDF = () => {
    if (!customers || customers.length === 0) return toast.error("Không có dữ liệu để xuất");
    const headers = ["STT", "Khách hàng", "SĐT", "Số lần câu", "Tổng chi", "Công nợ", "Hạng"];
    const rows = customers.map((c: any, i: number) => [
      i + 1,
      c?.fullName || "Khách câu",
      c?.phone || "--",
      c?.visitCount || 0,
      Number(c?.totalSpent || 0).toLocaleString() + "đ",
      Number(c?.debtBalance || 0).toLocaleString() + "đ",
      c?.isVip ? "VIP" : (c?.loyaltyTier || "BRONZE"),
    ]);
    exportToPDF({
      title: "Danh sách khách hàng & Cần thủ",
      headers,
      rows,
      filename: "danh_sach_khach_hang",
    });
    toast.success("Xuất PDF thành công");
  };

  return (
    <div className="space-y-5 select-none">
      
      {/* ── HEADER: Search & Actions ── */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleExportExcel}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown size={14} />
            <span>Xuất Excel</span>
          </button>
          
          <button 
            onClick={handleExportPDF}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown size={14} />
            <span>Xuất PDF</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <UserPlus size={15} className="stroke-[2.5]" />
            <span>Thêm hội viên</span>
          </button>
        </div>
      </div>

      {/* ── TABLE: Customers List ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-zinc-800/60 hover:bg-slate-50/80 border-b border-slate-100 dark:border-zinc-800">
              <TableHead className="pl-6 h-12 text-[11px] font-bold text-slate-600 dark:text-zinc-400">Hội viên & Cần thủ</TableHead>
              <TableHead className="h-12 text-[11px] font-bold text-slate-600 dark:text-zinc-400">Số điện thoại</TableHead>
              <TableHead className="h-12 text-[11px] font-bold text-slate-600 dark:text-zinc-400 text-center">Số lần câu</TableHead>
              <TableHead className="h-12 text-[11px] font-bold text-slate-600 dark:text-zinc-400 text-right">Tổng chi tiêu</TableHead>
              <TableHead className="h-12 text-[11px] font-bold text-slate-600 dark:text-zinc-400 text-right">Công nợ</TableHead>
              <TableHead className="h-12 pr-6 text-right text-[11px] font-bold text-slate-600 dark:text-zinc-400">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800/60 transition-colors">
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20 shrink-0">
                        {(customer?.fullName || "K")[0]?.toUpperCase() || "K"}
                      </div>
                      <div>
                        <Link href={`/dashboard/customers/${customer.id}`} className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                          {customer?.fullName || "Khách quen"}
                        </Link>
                        {customer?.isVip && (
                          <span className="ml-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">VIP</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600 dark:text-zinc-400">{customer?.phone || "--"}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900 dark:text-white text-center">{customer?.visitCount || 0}</TableCell>
                  <TableCell className="text-xs font-extrabold text-slate-900 dark:text-white text-right">{Number(customer?.totalSpent || 0).toLocaleString()} đ</TableCell>
                  <TableCell className="text-right">
                    <span className={cn("text-xs font-bold", Number(customer?.debtBalance || 0) > 0 ? "text-rose-600" : "text-slate-400")}>
                      {Number(customer?.debtBalance || 0).toLocaleString()} đ
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Link href={`/dashboard/customers/${customer.id}`}>
                      <button className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        Chi tiết
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-400">
                  Không tìm thấy khách hàng nào phù hợp
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── MODAL: Thêm hội viên mới ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Thêm hội viên mới</h2>
            <form action={handleAddCustomer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Họ và tên hoặc Biệt danh cần thủ</label>
                <input 
                  name="fullName" 
                  placeholder="Vd: Nguyễn Văn A" 
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-zinc-200" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Số điện thoại</label>
                <input 
                  name="phone" 
                  type="tel"
                  placeholder="Vd: 0912345678" 
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-zinc-200" 
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 h-10 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  Lưu hội viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
