export type SessionStatus = "ACTIVE" | "WARNING" | "EXPIRED" | "COMPLETED";

export interface SessionProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface FishingSession {
  id: string;
  hut_number: string;
  customer_id?: string;
  customer_name: string;
  phone: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  product_count: number;
  products: SessionProduct[];
  status: SessionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface SessionCardProps {
  session: FishingSession;
  onAddProduct?: (sessionId: string) => void;
  onExtendTime?: (sessionId: string) => void;
  onBuyback?: (sessionId: string) => void;
  onPayment?: (sessionId: string) => void;
}
