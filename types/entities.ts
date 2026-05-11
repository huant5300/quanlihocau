import { UserProfile } from "./auth/auth.types";

export type UUID = string;

export type { UserProfile };

export interface Tenant {
  id: UUID;
  name: string;
  phone: string;
  address?: string;
  is_active: boolean;
  owner: UUID;
}

export interface Customer {
  id: UUID;
  tenant: UUID;
  full_name: string;
  phone?: string;
  address?: string;
  total_spent: number;
  visit_count: number;
  created_at: string;
  updated_at: string;
}

export type CustomerInsert = Omit<Customer, "id" | "total_spent" | "visit_count" | "created_at" | "updated_at" | "tenant">;
export type CustomerUpdate = Partial<CustomerInsert>;

export type ProductCategory = "BAIT" | "DRINK" | "FOOD" | "EQUIPMENT" | "OTHER";

export interface Product {
  id: UUID;
  tenant: UUID;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  is_active: boolean;
}

export type ProductInsert = Omit<Product, "id" | "tenant">;
export type ProductUpdate = Partial<ProductInsert>;

export type SessionStatus = "ACTIVE" | "WARNING" | "EXPIRED" | "COMPLETED";

export interface Session {
  id: UUID;
  tenant: UUID;
  customer?: UUID;
  customer_name?: string;
  phone?: string;
  hut_number: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  total_amount: number;
  temporary_payment: number;
  final_amount: number;
  discount_amount: number;
  session_products?: SessionProduct[];
  fish_buybacks?: FishBuyback[];
  created_at: string;
  updated_at: string;
}

export type SessionInsert = {
  hut_number: string;
  customer_id?: string;
  customer_name?: string;
  phone?: string;
  start_time: string;
  end_time: string;
  total_amount?: number;
  products?: SessionProductInput[];
};

export type SessionUpdate = Partial<Session>;

export interface SessionProduct {
  id: UUID;
  session: UUID;
  product: UUID;
  quantity: number;
  price_at_time: number;
  name?: string;
  price?: number;
}

export interface SessionProductInput {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface FishType {
  id: UUID;
  tenant: UUID;
  name: string;
  buyback_price_per_kg: number;
}

export interface FishBuyback {
  id: UUID;
  tenant: UUID;
  session: UUID;
  fish_type: UUID;
  weight: number;
  price_per_kg: number;
  total_price: number;
}

export interface Payment {
  id: UUID;
  tenant: UUID;
  session: UUID;
  amount: number;
  method: "CASH" | "TRANSFER" | "MOMO" | "OTHER";
  created_at: string;
}

export type PaymentInsert = Omit<Payment, "id" | "tenant" | "created_at">;

export interface DashboardStats {
  activeCount: number;
  todayRevenue: number;
  customerCount: number;
  lowStockCount: number;
}

// Keep ActiveSession as an alias for backward compatibility
export type ActiveSession = Session;
