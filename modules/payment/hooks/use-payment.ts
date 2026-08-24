"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentInput } from "../schemas/payment.schema";
import { useState } from "react";
import { sessionService } from "@/services/api/session-service";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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

  const checkoutMutation = useMutation({
    mutationFn: async (data: PaymentInput) => {
      const methodMapping: Record<string, string> = {
        "Cash": "CASH",
        "Bank Transfer": "TRANSFER",
        "QR Payment": "TRANSFER"
      };
      const paymentMethod = methodMapping[data.paymentMethod] || "CASH";

      return sessionService.checkoutSession(sessionId, {
        amount: data.amountPaid,
        paymentMethod: paymentMethod,
        notes: data.notes
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["sessions"] });
      await queryClient.cancelQueries({ queryKey: ["active-sessions"] });

      const previousSessions = queryClient.getQueryData(["sessions"]);
      const previousActive = queryClient.getQueryData(["active-sessions"]);

      // Optimistically mark session as completed in lists
      queryClient.setQueryData(["sessions"], (old: any) => {
        if (!old) return old;
        return old.map((s: any) => s.id === sessionId ? { ...s, status: "COMPLETED" } : s);
      });
      queryClient.setQueryData(["active-sessions"], (old: any) => {
        if (!old) return old;
        return old.filter((s: any) => s.id !== sessionId);
      });

      return { previousSessions, previousActive };
    },
    onError: (err, newSessionData, context) => {
      queryClient.setQueryData(["sessions"], context?.previousSessions);
      queryClient.setQueryData(["active-sessions"], context?.previousActive);
      toast.error(err.message || "Thanh toán thất bại");
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["huts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const onSubmit = async (data: PaymentInput) => {
    checkoutMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isLoading,
    isSuccess,
    setIsSuccess,
  };
}
