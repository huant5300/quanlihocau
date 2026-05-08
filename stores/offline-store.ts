"use client";

import { create } from "zustand";
import { OfflineAction, SyncState } from "@/modules/offline/types/offline.types";

interface OfflineStore extends SyncState {
  queue: OfflineAction[];
  setOnline: (status: boolean) => void;
  addToQueue: (action: Omit<OfflineAction, "id" | "status" | "createdAt" | "retryCount">) => void;
  updateActionStatus: (id: string, status: OfflineAction["status"], error?: string) => void;
  removeFromQueue: (id: string) => void;
  setSyncing: (status: boolean) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  queue: [],

  setOnline: (status) => set({ isOnline: status }),
  
  setSyncing: (status) => set({ isSyncing: status }),

  addToQueue: (action) => set((state) => {
    const newAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      status: "pending",
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    const newQueue = [...state.queue, newAction];
    return { 
      queue: newQueue,
      pendingCount: newQueue.length
    };
  }),

  updateActionStatus: (id, status, error) => set((state) => ({
    queue: state.queue.map(a => a.id === id ? { ...a, status, lastError: error } : a)
  })),

  removeFromQueue: (id) => set((state) => {
    const newQueue = state.queue.filter(a => a.id !== id);
    return {
      queue: newQueue,
      pendingCount: newQueue.length,
      lastSyncedAt: newQueue.length === 0 ? new Date().toISOString() : state.lastSyncedAt
    };
  }),
}));
