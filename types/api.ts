export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
}

export interface PopularProduct {
  id: string;
  name: string;
  sold_count: number;
  revenue: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  sessions_count: number;
}

export interface TopCustomer {
  id: string;
  full_name: string;
  total_spent: number;
  visit_count: number;
}
