"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/api/customer-service";
import { Customer } from "@prisma/client";

export function useCustomers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => customerService.getCustomers(),
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search))
    );
  }, [customers, search]);

  return {
    customers: filteredCustomers,
    isLoading,
    search,
    setSearch,
    selectedCustomer,
    setSelectedCustomer,
    closeDetail: () => setSelectedCustomer(null),
  };
}
