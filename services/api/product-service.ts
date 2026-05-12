import { axiosApiClient } from "./axios-client";
import { Product, ProductInsert, ProductUpdate } from "@/types";

export const productService = {
  getProducts: async (search?: string) => {
    const url = search ? `/api/v1/products/?search=${search}` : "/api/v1/products/";
    const response = await axiosApiClient.get<any>(url);
    if (!response.success) throw new Error(response.error?.message);
    if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data || [];
  },

  getProductById: async (id: string) => {
    const response = await axiosApiClient.get<Product>(`/api/v1/products/${id}/`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  createProduct: async (product: ProductInsert) => {
    const response = await axiosApiClient.post<Product>("/api/v1/products/", product);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  updateProduct: async (id: string, product: ProductUpdate) => {
    const response = await axiosApiClient.patch<Product>(`/api/v1/products/${id}/`, product);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await axiosApiClient.delete(`/api/v1/products/${id}/`);
    if (!response.success) throw new Error(response.error?.message);
    return true;
  },
};
