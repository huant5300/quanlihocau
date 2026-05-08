"use client";

import { useEffect } from "react";
import { useOfflineStore } from "@/stores/offline-store";
import { toast } from "sonner";

export function useNetworkStatus() {
  const { setOnline, isOnline } = useOfflineStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast.success("Đã kết nối lại Internet", {
        description: "Hệ thống đang đồng bộ dữ liệu ngoại tuyến..."
      });
    };

    const handleOffline = () => {
      setOnline(false);
      toast.error("Mất kết nối Internet", {
        description: "Bạn đang ở chế độ ngoại tuyến. Dữ liệu sẽ được lưu tạm."
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  return { isOnline };
}
