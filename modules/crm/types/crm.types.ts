export type MembershipLevel = "Regular" | "Silver" | "Gold" | "VIP";

export interface CustomerActivity {
  id: string;
  type: "SESSION" | "PAYMENT" | "BUYBACK";
  description: string;
  timestamp: string;
  amount?: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  membershipLevel: MembershipLevel;
  totalSpending: number;
  totalSessions: number;
  favoriteFish?: string;
  lastVisit: string;
  avatarUrl?: string;
  activities?: CustomerActivity[];
}

export interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
}
