import { create } from "zustand";
import { FishingSession } from "@/modules/sessions/types/session.types";
import { showNativeNotification } from "@/utils/notification-helper";

export type ConnectionStatus = "stable" | "reconnecting" | "offline";

export interface AppNotification {
  id: string;
  type: "warning" | "expired";
  hutNumber: string;
  message: string;
  timestamp: string;
}

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

  // System Notifications for Warnings & Expired Sessions
  notifications: AppNotification[];
  addNotification: (type: "warning" | "expired", hutNumber: string, message: string) => void;
  removeNotificationByHut: (hutNumber: string, type: "warning" | "expired") => void;
  clearNotifications: () => void;
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
  
  tenantName: "Hồ câu giải trí",
  setTenantName: (name) => set({ tenantName: name }),
  
  currentLakeId: "lake_01",
  currentLakeName: "Hồ câu giải trí",
  setCurrentLake: (id, name) => set({ currentLakeId: id, currentLakeName: name, tenantName: name }),

  notifications: [],
  addNotification: (type, hutNumber, message) => set((state) => {
    // Avoid duplicate warnings for the same hut and type
    const exists = state.notifications.some(n => n.hutNumber === hutNumber && n.type === type);
    if (exists) return {};
    
    const newNotification: AppNotification = {
      id: Math.random().toString(),
      type,
      hutNumber,
      message,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
    };

    // Hiển thị thông báo đẩy (native notification)
    const title = type === "warning" ? `⚠️ Sắp hết giờ - Ô ${hutNumber}` : `✅ Tự động thanh toán - Ô ${hutNumber}`;
    showNativeNotification(title, {
      body: message,
      tag: `${type}-${hutNumber}`,
      url: "/dashboard/sessions"
    });

    return { notifications: [newNotification, ...state.notifications] };
  }),
  removeNotificationByHut: (hutNumber, type) => set((state) => ({
    notifications: state.notifications.filter(n => !(n.hutNumber === hutNumber && n.type === type))
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
