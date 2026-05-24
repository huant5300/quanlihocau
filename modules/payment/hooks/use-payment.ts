"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentInput } from "../schemas/payment.schema";
import { useState } from "react";
import { sessionService } from "@/services/api/session-service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePayment(totalAmount: number, sessionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

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
    try {
      const methodMapping: Record<string, string> = {
        "Cash": "CASH",
        "Bank Transfer": "TRANSFER",
        "QR Payment": "TRANSFER"
      };
      const paymentMethod = methodMapping[data.paymentMethod] || "CASH";

      await sessionService.checkoutSession(sessionId, {
        amount: data.amountPaid,
        paymentMethod: paymentMethod,
        notes: data.notes
      });
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error: any) {
      toast.error(error.message || "Thanh toán thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    isSuccess,
    setIsSuccess,
  };
}
