"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fishBuybackSchema, FishBuybackInput } from "../schemas/buyback.schema";
import { useEffect } from "react";

export function useFishBuyback() {
  const form = useForm<FishBuybackInput>({
    resolver: zodResolver(fishBuybackSchema),
    defaultValues: {
      fishType: "Black Carp",
      weight: 0,
      pricePerKg: 50000,
      totalAmount: 0,
    },
  });

  const { watch, setValue } = form;
  const weight = watch("weight");
  const pricePerKg = watch("pricePerKg");

  useEffect(() => {
    const total = Math.round(weight * pricePerKg);
    setValue("totalAmount", total);
  }, [weight, pricePerKg, setValue]);

  const handleTypeSelect = (type: any, defaultPrice: number) => {
    setValue("fishType", type);
    setValue("pricePerKg", defaultPrice);
  };

  return {
    form,
    handleTypeSelect,
    total: watch("totalAmount"),
  };
}
