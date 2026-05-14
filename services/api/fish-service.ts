import { axiosApiClient } from "./axios-client";
import { FishType } from "@/types";

export const fishService = {
  getFishTypes: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/fish/types");
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

  getFishTypeById: async (id: string) => {
    const response = await axiosApiClient.get<FishType>(`/api/v1/fish/types/${id}`);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },

  createFishType: async (fishType: Partial<FishType>) => {
    const response = await axiosApiClient.post<FishType>("/api/v1/fish/types", fishType);
    if (!response.success) throw new Error(response.error?.message);
    return response.data;
  },
};
