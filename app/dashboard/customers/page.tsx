import { CustomerRepository } from "@/repositories/customer-repository";
import { CustomersClient } from "./customers-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { getActiveLakeId } from "@/lib/lake-context";

export default async function CustomersPage() {
  const lakeId = await getActiveLakeId();
  const customers = await CustomerRepository.getAll(lakeId);

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Quản lý Hội viên" 
        subtitle="Quản lý thông tin, lịch sử câu và công nợ của hội viên."
      />
      
      <CustomersClient initialCustomers={JSON.parse(JSON.stringify(customers))} />
    </div>
  );
}
