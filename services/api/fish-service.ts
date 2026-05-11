import { axiosApiClient } from "./axios-client";
import { FishType } from "@/types";

export const fishService = {
  getFishTypes: async () => {
    const response = await axiosApiClient.get<any>("/api/v1/fish/types/");
    if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data || [];
  },

  createFishType: async (data: Partial<FishType>) => {
    const response = await axiosApiClient.post<FishType>("/api/v1/fish/types/", data);
    return response.data;
  },

  updateFishType: async (id: string, data: Partial<FishType>) => {
    const response = await axiosApiClient.patch<FishType>(`/api/v1/fish/types/${id}/`, data);
    return response.data;
  },

  deleteFishType: async (id: string) => {
    const response = await axiosApiClient.delete<void>(`/api/v1/fish/types/${id}/`);
    return response.data;
  }
};
