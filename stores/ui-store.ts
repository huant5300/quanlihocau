import { create } from "zustand";
import { FishingSession } from "@/modules/sessions/types/session.types";

export type ConnectionStatus = "stable" | "reconnecting" | "offline";

interface UIState {
  // Sidebar & Nav State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  
  // Connection Status
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  isOffline: boolean;
  setIsOffline: (status: boolean) => void;
  
  // Modals
  isOpenSessionModalOpen: boolean;
  setOpenSessionModalOpen: (open: boolean) => void;
  
  isPaymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  
  isCustomerModalOpen: boolean;
  setCustomerModalOpen: (open: boolean) => void;
  
  activeSessionForPayment: FishingSession | null;
  setActiveSessionForPayment: (session: FishingSession | null) => void;
  
  // Tenant Info
  tenantName: string;
  setTenantName: (name: string) => void;
  
  currentLakeId: string | null;
  currentLakeName: string | null;
  setCurrentLake: (id: string, name: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  isMobileNavOpen: false,
  setIsMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  
  connectionStatus: "stable",
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  isOffline: false,
  setIsOffline: (status) => set({ isOffline: status, connectionStatus: status ? "offline" : "stable" }),
  
  isOpenSessionModalOpen: false,
  setOpenSessionModalOpen: (open) => set({ isOpenSessionModalOpen: open }),
  
  isPaymentModalOpen: false,
  setPaymentModalOpen: (open) => set({ isPaymentModalOpen: open }),
  
  isCustomerModalOpen: false,
  setCustomerModalOpen: (open) => set({ isCustomerModalOpen: open }),
  
  activeSessionForPayment: null,
  setActiveSessionForPayment: (session) => set({ activeSessionForPayment: session }),
  
  tenantName: "Hồ Câu Đại Nam",
  setTenantName: (name) => set({ tenantName: name }),
  
  currentLakeId: "lake_01",
  currentLakeName: "Hồ Câu Đại Nam",
  setCurrentLake: (id, name) => set({ currentLakeId: id, currentLakeName: name, tenantName: name }),
}));
