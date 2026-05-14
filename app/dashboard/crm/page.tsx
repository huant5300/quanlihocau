import React from "react";
import { CRMClient } from "./crm-client";
import { Users, Trophy, Wallet } from "lucide-react";
import { CustomerModal } from "@/modules/crm/components/customer-modal";
import { getCustomersAction } from "@/actions/customer-actions";
import { DashboardHeader } from "@/components/shared/dashboard-header";

export default async function CRMPage() {
  const result = await getCustomersAction();
  const customers = result.success ? result.data || [] : [];

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter((c: any) => c.visitCount > 10).length;
  const totalDebt = customers.reduce((sum: number, c: any) => sum + Number(c.debtBalance || 0), 0);
  
  return (
    <div className="space-y-10">
      <DashboardHeader 
        title="Quản lý Hội viên" 
        subtitle="Chăm sóc và theo dõi lịch sử khách hàng tại hồ câu."
        actions={<CustomerModal />}
      />

      <div className="space-y-10">
        {/* CRM Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng hội viên</p>
              <h4 className="text-xl font-black">{totalCustomers}</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thành viên VIP</p>
              <h4 className="text-xl font-black text-purple-500">{vipCustomers}</h4>
            </div>
          </div>
          <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng nợ hội viên</p>
              <h4 className="text-xl font-black text-red-500">{totalDebt.toLocaleString()}đ</h4>
            </div>
          </div>
        </div>

        <CRMClient initialCustomers={JSON.parse(JSON.stringify(customers))} />
      </div>
    </div>
  );
}
