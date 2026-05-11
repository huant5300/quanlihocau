import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { APIResponse } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

class AxiosApiClient {
  private readonly client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor: Attach Token
    this.client.interceptors.request.use(
      (config) => {
        const tokens = useAuthStore.getState().tokens;
        if (tokens?.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle Token Expiration
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const tokens = useAuthStore.getState().tokens;
            if (!tokens?.refresh) throw new Error("No refresh token");

            const response = await axios.post(`${baseURL}/api/token/refresh/`, {
              refresh: tokens.refresh,
            });

            const newAccessToken = response.data.access;
            useAuthStore.getState().setTokens({
              ...tokens,
              access: newAccessToken,
            });

            this.isRefreshing = false;
            this.onRefreshed(newAccessToken);
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.map((cb) => cb(token));
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, data: body });
  }

  async put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data: body });
  }

  async patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: "PATCH", url, data: body });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.request<T>(config);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      return {
        success: false,
        error: {
          message: axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? axiosError.message,
          code: axiosError.code,
          details: axiosError.response?.data,
        },
      };
    }
  }
}

export const axiosApiClient = new AxiosApiClient();
export default axiosApiClient;
