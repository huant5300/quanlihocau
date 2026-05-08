"use client";

import { useEffect } from "react";
import { SyncService } from "@/lib/offline/sync-service";

export function PWARegistration() {
  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("SW registered:", registration);
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
