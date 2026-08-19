import { getCustomerDetailsAction } from "@/actions/customer-actions";
import { CustomerDetailClient } from "./customer-detail-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { notFound } from "next/navigation";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const res = await getCustomerDetailsAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Chi tiết Hội viên" 
        subtitle="Quản lý lịch sử câu, hóa đơn và công nợ của hội viên."
      />
      
      <CustomerDetailClient customer={JSON.parse(JSON.stringify(res.data))} />
    </div>
  );
}
