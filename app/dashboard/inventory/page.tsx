import { ProductRepository } from "@/repositories/product-repository";
import { InventoryClient } from "./inventory-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { getActiveLakeId } from "@/lib/lake-context";

export default async function InventoryPage() {
  try {
    const lakeId = await getActiveLakeId();
    const products = await ProductRepository.getAll(lakeId || "").catch(() => []);

    return (
      <div className="space-y-8">
        <DashboardHeader 
          title="Quản lý Kho hàng" 
          subtitle="Kiểm soát tồn kho, nhập xuất hàng hóa và cảnh báo hết hàng."
        />
        
        <InventoryClient products={JSON.parse(JSON.stringify(products || []))} />
      </div>
    );
  } catch (error) {
    console.error("InventoryPage error:", error);
    return (
      <div className="space-y-8">
        <DashboardHeader 
          title="Quản lý Kho hàng" 
          subtitle="Kiểm soát tồn kho, nhập xuất hàng hóa và cảnh báo hết hàng."
        />
        <InventoryClient products={[]} />
      </div>
    );
  }
}
