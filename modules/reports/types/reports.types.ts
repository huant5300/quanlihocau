export interface RevenueData {
  name: string;
  revenue: number;
  sessions: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  soldCount: number;
  revenue: number;
}

export interface CustomerGrowth {
  date: string;
  newCustomers: number;
}

export interface ReportsOverview {
  todayRevenue: number;
  weeklyRevenue: number;
  activeSessions: number;
  customerGrowth: number; // percentage
  buybackTotal: number;
}

export type TimeRange = "Today" | "Week" | "Month" | "Year";
