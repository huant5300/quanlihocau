"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openSessionSchema, OpenSessionInput } from "../schemas/open-session.schema";
import { useState, useEffect } from "react";
import { sessionService } from "@/services/api/session-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FishingPackage } from "@prisma/client";
import { printerService } from "@/services/printer/printer-service";

export function useOpenSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<FishingPackage[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    sessionService.getPackages().then(setPackages);
  }, []);

  const form = useForm<OpenSessionInput>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      phone_number: "",
      customer_name: "",
      hut_id: "",
      package_id: "",
      products: [],
      prepaid_amount: 0,
      should_print: true,
    },
  });

  // Tự động điền số tiền tạm thu bằng tổng cộng khi gói câu hoặc sản phẩm thay đổi
  const watchedPackageId = form.watch("package_id");
  const watchedProducts = form.watch("products");

  useEffect(() => {
    const selectedPkg = packages.find(p => p.id === watchedPackageId);
    const packagePrice = selectedPkg ? Number(selectedPkg.price) : 0;
    const productsPrice = (watchedProducts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    form.setValue("prepaid_amount", packagePrice + productsPrice);
  }, [watchedPackageId, watchedProducts, packages, form]);

  const onSubmit = async (data: OpenSessionInput) => {
    setIsLoading(true);
    try {
      const selectedPkg = packages.find((p: FishingPackage) => p.id === data.package_id);
      if (!selectedPkg) {
        toast.error("Vui lòng chọn gói câu");
        return false;
      }

      const productsPrice = data.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const sessionPrice = Number(selectedPkg.price);
      const totalAmount = sessionPrice + productsPrice;

      // Calculate end time
      const durationHours = Number(selectedPkg.durationHours) || 2;
      const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

      const result = await sessionService.createSession({
        areaId: data.hut_id,
        startTime: new Date().toISOString(),
        customerId: undefined, // Will handle customer creation/selection in API if needed
        customer_name: data.customer_name,
        phone: data.phone_number,
        hourlyRate: Number(selectedPkg.price) / durationHours, // Approximate hourly rate for overtime
        packageId: data.package_id,
        prepaidAmount: data.prepaid_amount,
        products: data.products.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          unitPrice: p.price
        })),
      });

      if (result) {
        toast.success("Đã mở lượt câu mới thành công");
        
        // In hóa đơn nếu được chọn
        if (data.should_print) {
          printerService.printBill({
            sessionId: result.id,
            hutNumber: result.area?.name || "N/A",
            customerName: result.customer?.fullName || "Khách lẻ",
            sessionFee: sessionPrice,
            products: data.products.map(p => ({
              name: p.name,
              quantity: p.quantity,
              price: p.price
            })),
            buybackDeduction: 0,
            totalAmount: totalAmount,
            prepaidAmount: data.prepaid_amount
          });
        }

        // Refresh data and redirect
        await queryClient.invalidateQueries({ queryKey: ["sessions"] });
        await queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
        
        router.push("/dashboard/sessions");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    packages,
  };
}
