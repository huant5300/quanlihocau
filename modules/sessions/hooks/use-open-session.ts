"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openSessionSchema, OpenSessionInput } from "../schemas/open-session.schema";
import { useState, useEffect } from "react";
import { sessionService } from "@/services/api/session-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function useOpenSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
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
    },
  });

  const onSubmit = async (data: OpenSessionInput) => {
    setIsLoading(true);
    try {
      // Fetch real packages
      const packages = await sessionService.getPackages();
      const selectedPkg = packages.find((p: any) => p.id === data.package_id);
      if (!selectedPkg) {
        toast.error("Vui lòng chọn gói câu");
        return false;
      }

      const productsPrice = data.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const totalAmount = parseFloat(selectedPkg.price) + productsPrice;

      // Calculate end time
      // Assuming duration_hours is decimal (e.g. 2.5)
      const durationHours = parseFloat(selectedPkg.duration_hours) || 2;
      const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

      const result = await sessionService.createSession({
        hut_number: data.hut_id,
        start_time: new Date().toISOString(),
        customer_name: data.customer_name,
        phone: data.phone_number,
        total_amount: totalAmount,
        end_time: endTime,
        products: data.products as any,
      });

      if (result) {
        toast.success("Đã mở lượt câu mới thành công");
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        queryClient.invalidateQueries({ queryKey: ["active-sessions"] });

        // Redirect immediately
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
