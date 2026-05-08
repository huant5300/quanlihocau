export interface FishingSession {
  id: string;
  hut_number: string;
  customer_name: string;
  phone_number: string;
  end_time: string;
  total_amount: number;
  product_count: number;
  status: "ACTIVE" | "EXPIRED";
}
