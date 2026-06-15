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
import { showNativeNotification } from "@/utils/notification-helper";

export function useOpenSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<FishingPackage[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    sessionService.getPackages().then(setPackages);
  }, []);

  // Default start_time to current time
  const now = new Date();
  const defaultStartTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const form = useForm<OpenSessionInput>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      start_time: defaultStartTime,
      phone_number: "",
      customer_name: "",
      customer_id: "",
      hut_id: "",
      package_id: "",
      products: [],
      prepaid_amount: 0,
      should_print: true,
    },
  });

  // Auto-fill prepaid amount when package or products change
  const watchedPackageId = form.watch("package_id");
  const watchedProducts = form.watch("products");
  const watchedIsCustom = form.watch("is_custom_package");
  const watchedCustomPrice = form.watch("custom_price");

  useEffect(() => {
    let packagePrice = 0;
    if (watchedPackageId === "custom" || watchedIsCustom) {
      packagePrice = Number(watchedCustomPrice || 0);
    } else {
      const selectedPkg = packages.find(p => p.id === watchedPackageId);
      packagePrice = selectedPkg ? Number(selectedPkg.price) : 0;
    }
    const productsPrice = (watchedProducts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    form.setValue("prepaid_amount", packagePrice + productsPrice);
  }, [watchedPackageId, watchedProducts, watchedIsCustom, watchedCustomPrice, packages, form]);

  const onSubmit = async (data: OpenSessionInput, managerOverride?: { username: string; password?: string }) => {
    setIsLoading(true);
    try {
      let durationHours = 0;
      let sessionPrice = 0;
      let selectedPkgName = "";

      if (data.package_id === "custom" || data.is_custom_package) {
        durationHours = Number(data.custom_hours || 1);
        sessionPrice = Number(data.custom_price || 0);
        selectedPkgName = `Giờ lẻ (${durationHours}h - Tự nhập)`;
      } else {
        const selectedPkg = packages.find((p: FishingPackage) => p.id === data.package_id);
        if (!selectedPkg) {
          toast.error("Vui lòng chọn gói câu");
          return false;
        }
        durationHours = Number(selectedPkg.durationHours) || 2;
        sessionPrice = data.custom_price !== undefined && data.custom_price !== null ? Number(data.custom_price) : Number(selectedPkg.price);
        selectedPkgName = selectedPkg.name;
      }

      // Calculate startTime from the form's start_time (HH:mm)
      const [startHH, startMM] = (data.start_time || defaultStartTime).split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(startHH, startMM, 0, 0);

      const productsList = data.products || [];
      const productsPrice = productsList.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const totalAmount = sessionPrice + productsPrice;

      const result = await sessionService.createSession({
        areaId: data.hut_id,
        startTime: startDate.toISOString(),
        customerId: data.customer_id || undefined,
        customer_name: data.customer_name,
        phone: data.phone_number,
        hourlyRate: sessionPrice / durationHours,
        packageId: data.package_id === "custom" ? undefined : data.package_id,
        prepaidAmount: data.prepaid_amount || 0,
        customPrice: sessionPrice,
        customDuration: durationHours,
        products: productsList.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          unitPrice: p.price
        })),
        managerOverride,
      });

      if (result) {
        toast.success("Đã mở lượt câu mới thành công");
        
        showNativeNotification("🎫 Mở lượt câu mới thành công", {
          body: `Ô số ${result.area?.name || "N/A"} - Khách: ${data.customer_name || "Khách lẻ"} - Gói: ${selectedPkgName}`,
          url: "/dashboard/sessions",
          tag: `open-session-${result.id}`
        });
        
        // Print bill if selected
        if (data.should_print) {
          printerService.printBill({
            sessionId: result.id,
            hutNumber: result.area?.name || "N/A",
            customerName: result.customer?.fullName || "Khách lẻ",
            sessionFee: sessionPrice,
            products: productsList.map(p => ({
              name: p.name,
              quantity: p.quantity,
              price: p.price
            })),
            buybackDeduction: 0,
            totalAmount: totalAmount,
            prepaidAmount: data.prepaid_amount || 0
          });
        }

        // Refresh data and redirect directly to sessions (no intermediate step)
        await queryClient.invalidateQueries({ queryKey: ["sessions"] });
        await queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        
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
