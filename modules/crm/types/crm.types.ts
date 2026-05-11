import { Customer as DbCustomer } from "@/types/common";

export type MembershipLevel = "Regular" | "Silver" | "Gold" | "VIP";

export interface CustomerActivity {
  id: string;
  type: "SESSION" | "PAYMENT" | "BUYBACK";
  description: string;
  timestamp: string;
  amount?: number;
}

export interface Customer extends DbCustomer {
  // Map DbCustomer fields if they differ significantly or add UI extras
  totalSpending?: number;
  totalSessions?: number;
  lastVisit?: string;
  activities?: CustomerActivity[];
}

export interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
}
