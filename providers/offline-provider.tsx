"use client";

import { useEffect } from "react";
import { sessionService } from "@/services/api/session-service";
import { syncMasterDataToOffline } from "@/lib/offline-db";

// Helper function to fetch standard products and areas if there isn't a dedicated endpoint yet
const fetchMasterData = async () => {
  try {
    const [packagesRes, productsRes, areasRes] = await Promise.all([
      sessionService.getPackages(),
      fetch("/api/v1/products").then(res => res.json()),
      fetch("/api/v1/settings/huts").then(res => res.json()),
    ]);
    
    // Some endpoints might return { success, data } or just the array depending on implementation
    const packages = Array.isArray(packagesRes) ? packagesRes : (packagesRes.data || []);
    const products = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);
    const areas = Array.isArray(areasRes) ? areasRes : (areasRes.data || []);
    
    await syncMasterDataToOffline(packages, products, areas);
  } catch (error) {
    console.error("OfflineProvider: Failed to fetch master data", error);
  }
};

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      // Sync on mount
      fetchMasterData();
      
      // Sync every 5 minutes just to keep local cache fresh
      const interval = setInterval(fetchMasterData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return <>{children}</>;
}
