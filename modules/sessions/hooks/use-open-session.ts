"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openSessionSchema, OpenSessionInput } from "../schemas/open-session.schema";
import { useState } from "react";

export function useOpenSession() {
  const [isLoading, setIsLoading] = useState(false);

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
    // Simulation
    console.log("Starting session:", data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    return true;
  };

  return {
    form,
    onSubmit,
    isLoading,
  };
}
