"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fishBuybackSchema, FishBuybackInput } from "../schemas/buyback.schema";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosApiClient } from "@/services/api/axios-client";
import { toast } from "sonner";

interface FishTypeFromDB {
  id: string;
  name: string;
  buybackPrice: number;
  image?: string;
}

export function useFishBuyback(sessionId: string) {
  const queryClient = useQueryClient();

  const form = useForm<FishBuybackInput>({
    resolver: zodResolver(fishBuybackSchema),
    defaultValues: {
      fishTypeId: "",
      weight: 0,
      pricePerKg: 0,
      totalAmount: 0,
      isSoldBack: true,
    },
  });

  const { watch, setValue } = form;
  const weight = watch("weight");
  const pricePerKg = watch("pricePerKg");

  // Auto-calculate total
  useEffect(() => {
    const total = Math.round(weight * pricePerKg);
    setValue("totalAmount", total);
  }, [weight, pricePerKg, setValue]);

  // Fetch fish types from DB
  const { data: fishTypes = [], isLoading: isLoadingTypes } = useQuery<FishTypeFromDB[]>({
    queryKey: ["fish-types"],
    queryFn: async () => {
      const res = await axiosApiClient.get<any>("/api/v1/fish/types");
      return Array.isArray(res) ? res : (res.data || []);
    },
    staleTime: 60000,
  });

  // Fetch catches history for this session
  const { data: catches = [], isLoading: isLoadingCatches } = useQuery({
    queryKey: ["fish-catches", sessionId],
    queryFn: async () => {
      const res = await axiosApiClient.get<any>(`/api/v1/fish/catches?sessionId=${sessionId}`);
      return Array.isArray(res) ? res : (res.data || []);
    },
    enabled: !!sessionId,
    staleTime: 5000,
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: FishBuybackInput) => {
      const res = await axiosApiClient.post<any>("/api/v1/fish/catches", {
        sessionId,
        fishTypeId: data.fishTypeId,
        weight: data.weight,
        isSoldBack: data.isSoldBack,
      });
      return res;
    },
    onSuccess: (res: any) => {
      const message = res?.message || "Ghi nhận thu mua cá thành công!";
      toast.success(message);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["fish-catches", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      // Reset form for next entry
      form.reset({
        fishTypeId: form.getValues("fishTypeId"),
        weight: 0,
        pricePerKg: form.getValues("pricePerKg"),
        totalAmount: 0,
        isSoldBack: true,
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi ghi nhận thu mua cá.");
    },
  });

  const handleTypeSelect = (fishTypeId: string, defaultPrice: number) => {
    setValue("fishTypeId", fishTypeId);
    setValue("pricePerKg", defaultPrice);
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => submitMutation.mutate(data))();
  };

  // Calculate total buyback from history
  const totalBuybackAmount = catches.reduce(
    (sum: number, c: any) => sum + Number(c.totalAmount || 0),
    0
  );

  return {
    form,
    fishTypes,
    catches,
    isLoadingTypes,
    isLoadingCatches,
    isSubmitting: submitMutation.isPending,
    handleTypeSelect,
    handleSubmit,
    total: watch("totalAmount"),
    totalBuybackAmount,
  };
}
