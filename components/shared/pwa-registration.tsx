"use client";

import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    // Unregister all existing Service Workers immediately
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) console.log("SW: Successfully unregistered service worker");
          });
        }
      });
    }

    // Clear all existing caches
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  }, []);

  return null;
}
