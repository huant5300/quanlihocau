import { ProductRepository } from "@/repositories/product-repository";
import { InventoryClient } from "./inventory-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";

export default async function InventoryPage() {
  const products = await ProductRepository.getAll();

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Quản lý Kho hàng" 
        subtitle="Kiểm soát tồn kho, nhập xuất hàng hóa và cảnh báo hết hàng."
      />
      
      <InventoryClient products={JSON.parse(JSON.stringify(products))} />
    </div>
  );
}
