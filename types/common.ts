import type {
  ActiveSession,
  Customer as CustomerEntity,
  DashboardStats as DashboardStatsEntity,
  FishBuyback as FishBuybackEntity,
  FishType as FishTypeEntity,
  Payment as PaymentEntity,
  Product as ProductEntity,
  ProductCategory,
  Session as SessionEntity,
  SessionStatus,
  SessionProduct as SessionProductEntity,
} from "@/types/entities";

export type Customer = CustomerEntity;
export type Product = ProductEntity;
export type FishingSession = SessionEntity;
export type Payment = PaymentEntity;
export type DashboardStats = DashboardStatsEntity;
export type FishBuyback = FishBuybackEntity;
export type FishType = FishTypeEntity;
export type SessionProduct = SessionProductEntity;

export interface ExtendedSession extends FishingSession {
  customer_name?: string;
  phone?: string;
  product_count?: number;
}

export type { ProductCategory, SessionStatus, ActiveSession };
