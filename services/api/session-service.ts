import { axiosApiClient } from "./axios-client";
import { Session, SessionInsert, SessionUpdate, SessionProductInput } from "@/types";

export const sessionService = {
  getPackages: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/tickets/packages/");
    if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data || [];
  },

  getSessions: async (status?: string) => {
    const url = status ? `/api/v1/tickets/sessions/?status=${status}` : "/api/v1/tickets/sessions/";
    const response = await axiosApiClient.get<any>(url);
    if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data || [];
  },

  getSessionById: async (id: string) => {
    const response = await axiosApiClient.get<Session>(`/api/v1/tickets/sessions/${id}/`);
    return response.data;
  },

  createSession: async (session: SessionInsert) => {
    const response = await axiosApiClient.post<Session>("/api/v1/tickets/sessions/", session);
    return response.data;
  },

  extendSession: async (id: string, hours: number, cost: number) => {
    const response = await axiosApiClient.post<any>(`/api/v1/tickets/sessions/${id}/extend/`, { hours, cost });
    return response.data;
  },

  updateSession: async (id: string, session: SessionUpdate) => {
    const response = await axiosApiClient.patch<Session>(`/api/v1/tickets/sessions/${id}/`, session);
    return response.data;
  },

  checkoutSession: async (id: string, paymentData: any) => {
    const response = await axiosApiClient.post<any>(`/api/v1/tickets/sessions/${id}/checkout/`, paymentData);
    return response.data;
  },

  buybackFish: async (id: string, weight: number, pricePerKg: number) => {
    const response = await axiosApiClient.post<any>(`/api/v1/tickets/sessions/${id}/buyback/`, { weight, price_per_kg: pricePerKg });
    return response.data;
  },

  addProducts: async (id: string, products: SessionProductInput[]) => {
    const response = await axiosApiClient.post<any>(`/api/v1/tickets/sessions/${id}/add_products/`, { products });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/tickets/sessions/stats/");
    return response.data;
  }
};
