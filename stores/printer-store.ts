import { create } from "zustand";

export interface PrinterState {
  connectionType: "bluetooth" | "lan";
  ipAddress: string;
  port: number;
  paperSize: "58mm" | "80mm";
  isConnected: boolean;
  isConnecting: boolean;
  setConnectionSettings: (settings: Partial<Pick<PrinterState, "connectionType" | "ipAddress" | "port" | "paperSize">>) => void;
  setConnectionStatus: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
}

export const usePrinterStore = create<PrinterState>((set) => {
  // Giá trị mặc định ban đầu
  let initialType: "bluetooth" | "lan" = "bluetooth";
  let initialIP = "192.168.1.100";
  let initialPort = 9100;
  let initialPaper: "58mm" | "80mm" = "58mm";

  // Đọc từ localStorage nếu đang ở môi trường client
  if (typeof window !== "undefined") {
    initialType = (localStorage.getItem("printer_type") as "bluetooth" | "lan") || "bluetooth";
    initialIP = localStorage.getItem("printer_ip") || "192.168.1.100";
    initialPort = Number(localStorage.getItem("printer_port")) || 9100;
    initialPaper = (localStorage.getItem("printer_paper_size") as "58mm" | "80mm") || "58mm";
  }

  return {
    connectionType: initialType,
    ipAddress: initialIP,
    port: initialPort,
    paperSize: initialPaper,
    isConnected: false,
    isConnecting: false,
    setConnectionSettings: (settings) => set((state) => {
      const newState = { ...state, ...settings };
      if (typeof window !== "undefined") {
        if (settings.connectionType) localStorage.setItem("printer_type", settings.connectionType);
        if (settings.ipAddress) localStorage.setItem("printer_ip", settings.ipAddress);
        if (settings.port !== undefined) localStorage.setItem("printer_port", String(settings.port));
        if (settings.paperSize) localStorage.setItem("printer_paper_size", settings.paperSize);
      }
      return newState;
    }),
    setConnectionStatus: (connected) => set({ isConnected: connected }),
    setIsConnecting: (connecting) => set({ isConnecting: connecting }),
  };
});
