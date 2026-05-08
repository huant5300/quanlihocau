import Dexie, { type EntityTable } from "dexie";

export interface OfflineAction {
  id?: number;
  type: "CREATE_SESSION" | "UPDATE_SESSION" | "PAYMENT" | "UPDATE_PRODUCT";
  payload: any;
  timestamp: number;
  status: "PENDING" | "SYNCING" | "FAILED";
  retryCount: number;
}

export interface CachedData {
  key: string; // e.g., "sessions", "products"
  data: any;
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
