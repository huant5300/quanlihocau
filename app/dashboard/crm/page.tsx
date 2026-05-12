"use client";

import React from "react";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { CRMClient } from "./crm-client";
import { Users, Trophy, Wallet } from "lucide-react";
import { CustomerModal } from "@/modules/crm/components/customer-modal";
import { CRMSkeleton } from "@/modules/crm/components/crm-skeleton";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/api/customer-service";

export default function CRMPage() {
  const [search, setSearch] = React.useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => customerService.getCustomers(search),
  });

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter((c: any) => c.visit_count > 10).length;
  const totalDebt = customers.reduce((sum: number, c: any) => sum + Number(c.debt_balance || 0), 0);
  
  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Quản lý Hội viên" 
          subtitle="Chăm sóc và theo dõi lịch sử khách hàng tại hồ câu."
          actions={<CustomerModal />}
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
              <h4 className="text-xl font-black">{isLoading ? "..." : totalCustomers}</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thành viên VIP</p>
              <h4 className="text-xl font-black text-purple-500">{isLoading ? "..." : vipCustomers}</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng nợ hội viên</p>
              <h4 className="text-xl font-black text-red-500">{isLoading ? "..." : totalDebt.toLocaleString()}đ</h4>
            </div>
          </div>
        </div>

        {isLoading ? (
          <CRMSkeleton />
        ) : (
          <CRMClient 
            customers={customers} 
            search={search}
            onSearchChange={setSearch}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
