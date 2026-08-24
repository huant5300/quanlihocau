"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openSessionSchema, OpenSessionInput } from "../schemas/open-session.schema";
import { useState, useEffect } from "react";
import { sessionService } from "@/services/api/session-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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

  const createMutation = useMutation({
    mutationFn: async (data: OpenSessionInput) => {
      const selectedPkg = packages.find((p: FishingPackage) => p.id === data.package_id);
      if (!selectedPkg) throw new Error("Vui lòng chọn gói câu");

      const durationHours = Number(selectedPkg.durationHours) || 2;
      return sessionService.createSession({
        areaId: data.hut_id,
        startTime: new Date().toISOString(),
        customerId: undefined,
        customer_name: data.customer_name,
        phone: data.phone_number,
        hourlyRate: Number(selectedPkg.price) / durationHours,
        packageId: data.package_id,
        prepaidAmount: data.prepaid_amount,
        products: data.products.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          unitPrice: p.price
        })),
      });
    },
    onMutate: async (newSessionData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["sessions"] });
      await queryClient.cancelQueries({ queryKey: ["active-sessions"] });

      const previousSessions = queryClient.getQueryData(["sessions"]);
      const previousActive = queryClient.getQueryData(["active-sessions"]);

      // Create a fake session object for instant UI rendering
      const tempId = `temp-${Date.now()}`;
      const selectedPkg = packages.find(p => p.id === newSessionData.package_id);
      
      const optimisticSession = {
        id: tempId,
        areaId: newSessionData.hut_id,
        customer: { fullName: newSessionData.customer_name || "Khách lẻ", phone: newSessionData.phone_number },
        startTime: new Date().toISOString(),
        status: "ACTIVE",
        FishingPackage: selectedPkg,
        sessionAmount: newSessionData.prepaid_amount,
        // Mock nested relations so UI doesn't crash
        area: { id: newSessionData.hut_id, name: "Vị trí đang mở..." },
        invoices: [],
        fishCatches: []
      };

      queryClient.setQueryData(["sessions"], (old: any) => {
        if (!old) return [optimisticSession];
        return [optimisticSession, ...old];
      });

      queryClient.setQueryData(["active-sessions"], (old: any) => {
        if (!old) return [optimisticSession];
        return [optimisticSession, ...old];
      });

      return { previousSessions, previousActive };
    },
    onError: (err, newSessionData, context) => {
      // Rollback
      queryClient.setQueryData(["sessions"], context?.previousSessions);
      queryClient.setQueryData(["active-sessions"], context?.previousActive);
      toast.error(err.message || "Đã có lỗi xảy ra");
    },
    onSuccess: (result, variables) => {
      toast.success("Đã mở lượt câu mới thành công");
      
      if (variables.should_print) {
        const selectedPkg = packages.find(p => p.id === variables.package_id);
        printerService.printBill({
          sessionId: result.id,
          hutNumber: result.area?.name || "N/A",
          customerName: result.customer?.fullName || "Khách lẻ",
          sessionFee: Number(selectedPkg?.price || 0),
          products: variables.products.map(p => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price
          })),
          buybackDeduction: 0,
          totalAmount: Number(selectedPkg?.price || 0) + variables.products.reduce((s, p) => s + p.price * p.quantity, 0),
          prepaidAmount: variables.prepaid_amount
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["huts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const onSubmit = async (data: OpenSessionInput) => {
    // Navigate instantly before waiting for mutation to finish
    router.push("/dashboard/sessions");
    createMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isLoading: createMutation.isPending,
    packages,
  };
}
