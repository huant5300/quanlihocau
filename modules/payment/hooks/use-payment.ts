"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentInput } from "../schemas/payment.schema";
import { useState } from "react";

export function usePayment(totalAmount: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "Cash",
      amountPaid: totalAmount,
      notes: "",
    },
  });

  const onSubmit = async (data: PaymentInput) => {
    setIsLoading(true);
    // Simulation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
    return true;
  };

  return {
    form,
    onSubmit,
    isLoading,
    isSuccess,
    setIsSuccess,
  };
}
