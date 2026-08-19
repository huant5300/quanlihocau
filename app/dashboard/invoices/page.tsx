import { getInvoicesAction, getInvoiceStatsAction } from "@/actions/invoice-actions";
import { InvoicesClient } from "./invoices-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";

export default async function InvoicesPage() {
  const [invoicesRes, statsRes] = await Promise.all([
    getInvoicesAction({}),
    getInvoiceStatsAction({}),
  ]);

  const initialInvoices = invoicesRes.success ? invoicesRes.data || [] : [];
  const initialStats = statsRes.success 
    ? statsRes.data 
    : { revenue: 0, unpaid: 0, paid: 0, debt: 0 };

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Quản lý Đơn hàng" 
        subtitle="Theo dõi hóa đơn, công nợ và doanh thu thực tế của hồ câu."
      />
      
      <InvoicesClient 
        initialInvoices={JSON.parse(JSON.stringify(initialInvoices))} 
        initialStats={JSON.parse(JSON.stringify(initialStats))}
      />
    </div>
  );
}
