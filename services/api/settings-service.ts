import { axiosApiClient } from "./axios-client";

export interface LakeInfo {
  name: string;
  address: string;
  totalSpots: number;
  receipt_footer: string;
}

export const settingsService = {
  getLakeInfo: async () => {
    const response = await axiosApiClient.get<LakeInfo>("/api/v1/settings/lake");
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  updateLakeInfo: async (info: Partial<LakeInfo>) => {
    const response = await axiosApiClient.patch<LakeInfo>("/api/v1/settings/lake", info);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  getPackages: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/settings/packages");
    if (!response.success) throw new Error(response.error?.message);
    
    // Support both direct array response (Next.js) and { results: [] } (Legacy/Django)
    if (response.data && typeof response.data === 'object') {
      if ('results' in response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    return response.data || [];
  },

  getHuts: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/settings/huts");
    if (!response.success) throw new Error(response.error?.message);

    // Support both direct array response (Next.js) and { results: [] } (Legacy/Django)
    if (response.data && typeof response.data === 'object') {
      if ('results' in response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    return response.data || [];
  },

  createPackage: async (data: any) => {
    const response = await axiosApiClient.post<any>("/api/v1/settings/packages", data);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  updatePackage: async (id: string, data: any) => {
    const response = await axiosApiClient.patch<any>(`/api/v1/settings/packages/${id}`, data);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  deletePackage: async (id: string) => {
    const response = await axiosApiClient.delete<any>(`/api/v1/settings/packages/${id}`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  createHut: async (data: any) => {
    const response = await axiosApiClient.post<any>("/api/v1/settings/huts", data);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  updateHut: async (id: string, data: any) => {
    const response = await axiosApiClient.patch<any>(`/api/v1/settings/huts/${id}`, data);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  deleteHut: async (id: string) => {
    const response = await axiosApiClient.delete<any>(`/api/v1/settings/huts/${id}`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  }
};
