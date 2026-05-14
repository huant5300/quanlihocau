export type PaymentMethod = "Cash" | "Bank Transfer" | "QR Payment";
export type PaymentStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface BillData {
  sessionId: string;
  hutNumber: string;
  customerName: string;
  sessionFee: number;
  products: BillItem[];
  buybackDeduction: number;
  prepaidAmount: number;
  subtotal: number;
  totalAmount: number;
}

export interface PaymentTransaction {
  id: string;
  billId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  timestamp: string;
}
