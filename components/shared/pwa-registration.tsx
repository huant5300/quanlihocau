"use client";

import { useEffect } from "react";
import { SyncService } from "@/lib/offline/sync-service";
import { requestNotificationPermission } from "@/utils/notification-helper";

export function PWARegistration() {
  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("SW registered:", registration);
            // Yêu cầu quyền thông báo sau khi đăng ký SW thành công
            requestNotificationPermission().then((granted) => {
              if (granted) {
                console.log("SW: Quyền thông báo đã được cấp.");
              }
            });
          },
          (err) => {
            console.log("SW registration failed:", err);
          }
        );
      });
    }

    // Initialize Sync Service
    SyncService.init();
    
    // Initial sync check
    SyncService.processQueue();
  }, []);

  return null;
}
