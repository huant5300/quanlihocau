"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OpenSessionInput } from "../schemas/open-session.schema";
import { sessionService } from "@/services/api/session-service";

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OpenSessionInput) => {
      const result = await sessionService.createSession({
        hut_number: input.hut_id,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Default 4h
        customer_name: input.customer_name,
        phone: input.phone_number,
        products: input.products,
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Mở lượt câu thành công!");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Không thể mở lượt câu. Vui lòng thử lại.";
      toast.error(message);
    }
  });
}
