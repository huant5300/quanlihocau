import { ProductRepository } from "@/repositories/product-repository";
import { POSClient } from "./pos-client";
import { DashboardHeader } from "@/components/shared/dashboard-header";

export default async function POSPage() {
  const [products, categories] = await Promise.all([
    ProductRepository.getAll(),
    ProductRepository.getCategories()
  ]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <DashboardHeader 
        title="Bán hàng (POS)" 
        subtitle="Hệ thống bán đồ câu và dịch vụ nhanh."
      />
      
      <POSClient 
        products={JSON.parse(JSON.stringify(products))} 
        categories={JSON.parse(JSON.stringify(categories))} 
      />
    </div>
  );
}
