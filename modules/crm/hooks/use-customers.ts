"use client";

import { useState, useMemo } from "react";
import { Customer } from "../types/crm.types";

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    fullName: "Nguyễn Hoàng Nam",
    phoneNumber: "0912345678",
    membershipLevel: "VIP",
    totalSpending: 12500000,
    totalSessions: 42,
    favoriteFish: "Black Carp",
    lastVisit: "2 giờ trước",
  },
  {
    id: "c2",
    fullName: "Trần Minh Tâm",
    phoneNumber: "0988777666",
    membershipLevel: "Gold",
    totalSpending: 8400000,
    totalSessions: 28,
    lastVisit: "Hôm qua",
  },
  {
    id: "c3",
    fullName: "Lê Thị Hồng",
    phoneNumber: "0333222111",
    membershipLevel: "Silver",
    totalSpending: 3200000,
    totalSessions: 12,
    lastVisit: "3 ngày trước",
  },
  {
    id: "c4",
    fullName: "Phạm Văn Đức",
    phoneNumber: "0900111222",
    membershipLevel: "Regular",
    totalSpending: 850000,
    totalSessions: 3,
    lastVisit: "Tuần trước",
  },
];

export function useCustomers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => 
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search)
    );
  }, [search]);

  return {
    customers: filteredCustomers,
    search,
    setSearch,
    selectedCustomer,
    setSelectedCustomer,
    closeDetail: () => setSelectedCustomer(null),
  };
}
