import Dexie, { type EntityTable } from "dexie";

type OfflinePayloadByType = {
  CREATE_SESSION: any;
  UPDATE_SESSION: { id: string } & any;
  PAYMENT: any;
  UPDATE_PRODUCT: { id: string } & any;
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
