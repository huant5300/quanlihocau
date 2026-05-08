export type SyncStatus = "synced" | "pending" | "failed" | "retrying";

export type OfflineActionType = 
  | "OPEN_SESSION" 
  | "ADD_PRODUCT" 
  | "FISH_BUYBACK" 
  | "COMPLETE_PAYMENT";

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  status: SyncStatus;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt?: string;
}
