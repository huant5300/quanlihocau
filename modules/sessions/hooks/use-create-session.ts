"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { OpenSessionInput } from "../schemas/open-session.schema";

export function useCreateSession() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OpenSessionInput) => {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{
          ...input,
          status: "ACTIVE",
          start_time: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic Update Flow
    onMutate: async (newSession) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["active-sessions"] });

      // Snapshot the previous value
      const previousSessions = queryClient.getQueryData(["active-sessions"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["active-sessions"], (old: any) => [
        {
          id: "temp-id",
          ...newSession,
          status: "ACTIVE",
          start_time: new Date().toISOString(),
          total_amount: 0,
          product_count: newSession.products.length,
        },
        ...(old || []),
      ]);

      return { previousSessions };
    },
    onError: (err, newSession, context) => {
      // Rollback to the previous value if error occurs
      queryClient.setQueryData(["active-sessions"], context?.previousSessions);
      toast.error("Không thể mở lượt câu. Vui lòng thử lại.");
    },
    onSuccess: () => {
      toast.success("Mở lượt câu thành công!");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
    },
  });
}
