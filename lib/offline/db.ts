import Dexie, { type EntityTable } from "dexie";
import type { PaymentInsert, ProductUpdate, SessionInsert } from "@/types";

type OfflinePayloadByType = {
  CREATE_SESSION: SessionInsert;
  UPDATE_SESSION: { id: string } & Partial<SessionInsert>;
  PAYMENT: PaymentInsert;
  UPDATE_PRODUCT: { id: string } & ProductUpdate;
};

export type OfflineActionType = keyof OfflinePayloadByType;
export type OfflinePayload = OfflinePayloadByType[OfflineActionType];

export interface OfflineAction {
  id?: number;
  type: OfflineActionType;
  payload: OfflinePayload;
  timestamp: number;
  status: "PENDING" | "SYNCING" | "FAILED";
  retryCount: number;
}

export interface CachedData {
  key: string; // e.g., "sessions", "products"
  data: unknown;
  updatedAt: number;
}

class FishingOfflineDB extends Dexie {
  syncQueue!: EntityTable<OfflineAction, "id">;
  cache!: EntityTable<CachedData, "key">;

  constructor() {
    super("FishingPOS_OfflineDB");
    this.version(1).stores({
      syncQueue: "++id, type, status, timestamp",
      cache: "key, updatedAt"
    });
  }
}

export const db = new FishingOfflineDB();
