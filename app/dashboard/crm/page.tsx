"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { CustomerCard } from "@/modules/crm/components/customer-card";
import { CustomerDetailDrawer } from "@/modules/crm/components/customer-detail-drawer";
import { useCustomers } from "@/modules/crm/hooks/use-customers";
import { UserPlus, Search, Users, Trophy, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CRMPage() {
  const { customers, search, setSearch, selectedCustomer, setSelectedCustomer, closeDetail } = useCustomers();

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Quản lý Hội viên" 
          subtitle="Chăm sóc và theo dõi lịch sử khách hàng tại hồ câu."
          actions={
            <button className="h-14 px-6 bg-primary text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <UserPlus size={20} strokeWidth={3} />
              <span>Thêm hội viên</span>
            </button>
          }
        />
      }
    >
      <div className="space-y-10">
        {/* CRM Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng hội viên</p>
              <h4 className="text-xl font-black">1,248</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thành viên VIP</p>
              <h4 className="text-xl font-black text-purple-500">86</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tích lũy tháng</p>
              <h4 className="text-xl font-black text-green-500">450.5M</h4>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold"
          />
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {customers.map((customer) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                onClick={setSelectedCustomer}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Customer Detail Drawer */}
        <CustomerDetailDrawer 
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={closeDetail}
        />
      </div>
    </DashboardLayout>
  );
}
