export type UUID = string;

export type UserRole = "SUPER_ADMIN" | "OWNER" | "STAFF" | "CASHIER";

export interface Tenant {
  id: UUID;
  name: string;
  phone: string;
  address?: string;
  isActive: boolean;
  ownerId: UUID;
}

export interface Customer {
  id: UUID;
  lakeId?: UUID;
  fullName: string;
  phone: string;
  address?: string;
  debtBalance: number;
  totalSpent: number;
  visitCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerInsert = Omit<Customer, "id" | "debtBalance" | "totalSpent" | "visitCount" | "createdAt" | "updatedAt">;
export type CustomerUpdate = Partial<CustomerInsert>;

export type ProductCategory = "BAIT" | "DRINK" | "FOOD" | "EQUIPMENT" | "OTHER";

export interface Product {
  id: UUID;
  lakeId?: UUID;
  categoryId: UUID;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  category?: string; // For UI display
}

export type ProductInsert = Omit<Product, "id" | "lakeId" | "isActive" | "category">;
export type ProductUpdate = Partial<ProductInsert>;

export type SessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED" | "OVERDUE";

export interface Session {
  id: UUID;
  lakeId: UUID;
  areaId: UUID;
  customerId?: UUID;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  hourlyRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  area?: any;
  customer?: any;
}

export interface SessionInsert {
  areaId?: string;
  hut_number?: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  customerId?: string;
  customer_name?: string;
  phone?: string;
  hourlyRate?: number;
  packageId?: string;
  prepaidAmount?: number;
  total_amount?: number;
  products?: any[];
}

export type SessionUpdate = Partial<SessionInsert> & { status?: SessionStatus };

export interface SessionProduct {
  id: UUID;
  sessionId: UUID;
  productId: UUID;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export type SessionProductInput = Omit<SessionProduct, "id" | "sessionId" | "totalPrice" | "createdAt">;

export interface FishType {
  id: UUID;
  name: string;
  buybackPrice: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FishBuyback {
  id: UUID;
  sessionId: UUID;
  fishTypeId: UUID;
  weight: number;
  buybackPrice: number;
  totalAmount: number;
  isSoldBack: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: UUID;
  lakeId: UUID;
  sessionId?: UUID;
  customerId?: UUID;
  amount: number;
  method: "CASH" | "TRANSFER" | "DEBT";
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

export interface ActiveSession extends Session {
  hut_number: string;
  customer_name?: string;
  phone?: string;
  total_amount: number;
  prepaidAmount?: number;
  session_products?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    price_at_time?: number;
  }>;
  fish_buybacks?: Array<{
    id: string;
    total_price: number;
  }>;
}

export interface DashboardStats {
  activeCount: number;
  todayRevenue: number;
  customerCount: number;
  lowStockCount: number;
  sessionRevenue?: number;
  productRevenue?: number;
}
