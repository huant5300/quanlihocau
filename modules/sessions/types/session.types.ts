import type { ActiveSession, SessionStatus } from "@/types";

export type { SessionStatus };

export interface SessionProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type FishingSession = ActiveSession;

export interface SessionCardProps {
  session: FishingSession;
  onAddProduct?: (sessionId: string) => void;
  onExtendTime?: (sessionId: string) => void;
  onBuyback?: (sessionId: string) => void;
  onPayment?: (sessionId: string) => void;
}
