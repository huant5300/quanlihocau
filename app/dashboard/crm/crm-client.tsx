"use client";

import React, { useState } from "react";
import { CustomerCard } from "@/modules/crm/components/customer-card";
import { CustomerDetailDrawer } from "@/modules/crm/components/customer-detail-drawer";
import { Search, FileDown, Table as TableIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { exportToExcel } from "@/utils/export-excel";
import { exportToPDF } from "@/utils/export-pdf";
import { toast } from "sonner";
import Link from "next/link";

interface CRMClientProps {
  initialCustomers: any[];
}

export function CRMClient({ initialCustomers }: CRMClientProps) {
  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  const handleExportExcel = () => {
    if (customers.length === 0) return toast.error("Không có dữ liệu hội viên để xuất");
    const data = customers.map((c: any, i: number) => ({
      "STT": i + 1,
      "Tên khách hàng": c.fullName,
      "SĐT": c.phone?.startsWith("KH_") ? "Chưa có SĐT" : c.phone,
      "Số lần câu": c.visitCount || 0,
      "Tổng chi (VNĐ)": Number(c.totalSpent || 0),
      "Công nợ (VNĐ)": Number(c.debtBalance || 0),
      "Hạng": (c.visitCount || 0) > 10 ? "VIP" : "Thành viên",
    }));
    exportToExcel(data, `danh_sach_hoi_vien_crm`);
    toast.success("Xuất danh sách hội viên Excel thành công!");
  };

  const handleExportPDF = () => {
    if (customers.length === 0) return toast.error("Không có dữ liệu hội viên để xuất");
    const headers = ["STT", "Họ và tên", "Số điện thoại", "Số lần câu", "Tổng chi tiêu", "Công nợ"];
    const rows = customers.map((c: any, i: number) => [
      i + 1, 
      c.fullName, 
      c.phone?.startsWith("KH_") ? "--" : c.phone, 
      c.visitCount || 0, 
      Number(c.totalSpent || 0).toLocaleString() + "đ", 
      Number(c.debtBalance || 0).toLocaleString() + "đ"
    ]);
    exportToPDF({
      title: "Báo cáo Danh sách Hội viên & Cần thủ",
      headers,
      rows,
      filename: "danh_sach_hoi_vien_crm"
    });
    toast.success("Xuất PDF thành công!");
  };

  return (
    <div className="space-y-6">
      {/* Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleExportExcel}
            className="h-12 px-4 bg-accent/60 hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95"
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="h-12 px-4 bg-accent/60 hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95"
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Xuất PDF</span>
          </button>

          <Link
            href="/dashboard/customers"
            className="h-12 px-4 bg-accent/60 hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95 text-slate-700 dark:text-zinc-300"
          >
            <TableIcon size={16} />
            <span className="hidden sm:inline">Dạng bảng</span>
          </Link>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onClick={() => setSelectedCustomer(customer)}
            />
          ))}
        </AnimatePresence>
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-[2rem]">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Không tìm thấy khách hàng nào</p>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer 
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
