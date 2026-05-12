import { axiosApiClient } from "./axios-client";

export const reportService = {
  getRevenueStats: async (period: string = "Week") => {
    const response = await axiosApiClient.get<any>(`/api/v1/reports/revenue/?period=${period}`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data || [];
  },

  getPopularProducts: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/reports/popular-products/");
    if (!response.success) throw new Error(response.error?.message);
    return response.data || [];
  },

  getTopCustomers: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/reports/top-customers/");
    if (!response.success) throw new Error(response.error?.message);
    return response.data || [];
  },

  exportData: async (type: "revenue" | "customers" | "products") => {
    // For now, return a mockup or call a real endpoint if it exists
    // In a real production app, this would call a backend endpoint that returns a CSV/Excel file
    return `/api/v1/reports/export/?type=${type}`;
  }
};
