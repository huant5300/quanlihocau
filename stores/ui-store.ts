import { create } from "zustand";
import { FishingSession } from "@/types/sessions";

interface UIState {
  // Sidebar State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  
  // Connection Status
  isOffline: boolean;
  setIsOffline: (status: boolean) => void;
  
  // Modals
  openSessionModalOpen: boolean;
  setOpenSessionModalOpen: (open: boolean) => void;
  
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  
  activeSessionForPayment: FishingSession | null;
  setActiveSessionForPayment: (session: FishingSession | null) => void;
  
  // Tenant Info
  tenantName: string;
  setTenantName: (name: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  isOffline: false,
  setIsOffline: (status) => set({ isOffline: status }),
  
  openSessionModalOpen: false,
  setOpenSessionModalOpen: (open) => set({ openSessionModalOpen: open }),
  
  paymentModalOpen: false,
  setPaymentModalOpen: (open) => set({ paymentModalOpen: open }),
  
  activeSessionForPayment: null,
  setActiveSessionForPayment: (session) => set({ activeSessionForPayment: session }),
  
  tenantName: "Hồ Câu Thiên Đường",
  setTenantName: (name) => set({ tenantName: name }),
}));
