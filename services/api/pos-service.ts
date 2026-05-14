import { axiosApiClient } from "./axios-client";

export interface POSCheckoutItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface POSCheckoutData {
  items: POSCheckoutItem[];
  customerId?: string;
  paymentMethod: "CASH" | "TRANSFER" | "DEBT";
  notes?: string;
}

export const posService = {
  checkout: async (data: POSCheckoutData) => {
    const response = await axiosApiClient.post<any>("/api/v1/pos/checkout", data);
    if (!response.success) {
      throw new Error(response.error?.message || "Lỗi khi thanh toán");
    }
    return response.data;
  }
};
