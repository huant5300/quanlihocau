import { axiosApiClient } from "./axios-client";
import { Customer, CustomerInsert, CustomerUpdate } from "@/types";

export const customerService = {
  getCustomers: async (search?: string) => {
    const url = search ? `/api/v1/customers/?search=${search}` : "/api/v1/customers/";
    const response = await axiosApiClient.get<any>(url);
    if (!response.success) throw new Error(response.error?.message);
    if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data || [];
  },

  getCustomerById: async (id: string) => {
    const response = await axiosApiClient.get<Customer>(`/api/v1/customers/${id}/`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  createCustomer: async (customer: CustomerInsert) => {
    const response = await axiosApiClient.post<Customer>("/api/v1/customers/", customer);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  updateCustomer: async (id: string, updates: CustomerUpdate) => {
    const response = await axiosApiClient.put<Customer>(`/api/v1/customers/${id}/`, updates);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await axiosApiClient.delete<void>(`/api/v1/customers/${id}/`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },
};
