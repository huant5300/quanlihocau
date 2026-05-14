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
