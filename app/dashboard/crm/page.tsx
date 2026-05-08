"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { CustomerTable, Customer } from "@/modules/crm/components/customer-table";
import { CustomerDetailDrawer } from "@/modules/crm/components/customer-detail-drawer";
import { Users, Search, Plus, Filter, Download } from "lucide-react";

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", full_name: "Nguyễn Văn A", phone_number: "0912345678", total_visits: 42, total_spent: 12500000, last_visit: "Hôm nay", is_vip: true },
  { id: "2", full_name: "Trần Thị B", phone_number: "0987654321", total_visits: 12, total_spent: 3400000, last_visit: "2 ngày trước", is_vip: false },
  { id: "3", full_name: "Lê Văn C", phone_number: "0333444555", total_visits: 5, total_spent: 1200000, last_visit: "1 tuần trước", is_vip: false },
  { id: "4", full_name: "Phạm Minh D", phone_number: "0909123123", total_visits: 89, total_spent: 45000000, last_visit: "Hôm qua", is_vip: true },
];

export default function CRMPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone_number.includes(searchQuery)
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Users size={28} />
              <h1 className="text-3xl font-black tracking-tight">Khách hàng (CRM)</h1>
            </div>
            <p className="text-muted-foreground">Quản lý danh sách, lịch sử câu và hạng thành viên.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center hover:bg-accent/80 transition-all">
              <Download size={24} />
            </button>
            <button className="h-14 bg-primary text-white px-8 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Plus size={24} /> Thêm khách hàng
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-card border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none shadow-sm transition-all font-medium"
            />
          </div>
          <button className="h-14 px-6 bg-card border-2 border-transparent hover:border-primary/20 rounded-2xl flex items-center gap-2 font-bold transition-all">
            <Filter size={20} /> Bộ lọc
          </button>
        </div>

        {/* Table Section */}
        <section>
          <CustomerTable 
            customers={filteredCustomers} 
            onSelect={(c) => setSelectedCustomer(c)} 
          />
        </section>
      </div>

      {/* Detail Drawer */}
      <CustomerDetailDrawer 
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </MainLayout>
  );
}
