import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { APIResponse } from "@/types";

const rawBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/";
// Clean up if the key was accidentally duplicated in .env
const baseURL = rawBaseURL.includes("NEXT_PUBLIC_API_BASE_URL=") 
  ? rawBaseURL.split("NEXT_PUBLIC_API_BASE_URL=").pop() || "/" 
  : rawBaseURL;

class AxiosApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => {
        // Check if response is HTML (happens on 404 or redirects)
        const contentType = response.headers["content-type"];
        if (typeof contentType === "string" && contentType.includes("text/html")) {
          return Promise.reject({
            message: "API returned HTML instead of JSON. Check the endpoint URL.",
            response: response,
            isHtmlError: true
          });
        }
        return response;
      },
      (error: AxiosError) => {
        // Handle unauthorized or other errors that might return HTML
        const contentType = error.response?.headers?.["content-type"];
        if (typeof contentType === "string" && contentType.includes("text/html")) {
          return Promise.reject({
            ...error,
            message: `API Error ${error.response?.status}: Expected JSON but received HTML.`,
            isHtmlError: true
          });
        }
        return Promise.reject(error);
      }
    );
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
    } catch (error: any) {
      if (error.isHtmlError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: "ERR_HTML_RESPONSE",
          },
        };
      }

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
