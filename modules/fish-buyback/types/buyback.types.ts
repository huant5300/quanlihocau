export type FishType = "Black Carp" | "Grass Carp" | "Catfish" | "Tilapia" | "Other";

export interface FishBuybackTransaction {
  id: string;
  sessionId: string;
  fishType: FishType;
  weight: number;
  pricePerKg: number;
  totalAmount: number;
  timestamp: string;
}

export interface FishTypeConfig {
  type: FishType;
  label: string;
  defaultPrice: number;
}

export const FISH_TYPES: FishTypeConfig[] = [
  { type: "Black Carp", label: "Trắm Đen", defaultPrice: 50000 },
  { type: "Grass Carp", label: "Trắm Cỏ", defaultPrice: 35000 },
  { type: "Catfish", label: "Cá Lăng", defaultPrice: 45000 },
  { type: "Tilapia", label: "Cá Rô Phi", defaultPrice: 20000 },
  { type: "Other", label: "Loại khác", defaultPrice: 25000 },
];
