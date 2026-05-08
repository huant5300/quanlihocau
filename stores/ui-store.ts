import { create } from "zustand";

import { FishingSession } from "@/types/sessions";

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  openSessionModalOpen: boolean;
  setOpenSessionModalOpen: (open: boolean) => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  activeSessionForPayment: FishingSession | null;
  setActiveSessionForPayment: (session: FishingSession | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openSessionModalOpen: false,
  setOpenSessionModalOpen: (open) => set({ openSessionModalOpen: open }),
  paymentModalOpen: false,
  setPaymentModalOpen: (open) => set({ paymentModalOpen: open }),
  activeSessionForPayment: null,
  setActiveSessionForPayment: (session) => set({ activeSessionForPayment: session }),
}));
