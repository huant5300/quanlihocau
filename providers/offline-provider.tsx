"use client";

import { useEffect, useCallback } from "react";
import { sessionService } from "@/services/api/session-service";
import { syncMasterDataToOffline, offlineDB } from "@/lib/offline-db";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const fetchMasterData = async () => {
  try {
    const [packagesRes, productsRes, areasRes] = await Promise.all([
      sessionService.getPackages(),
      fetch("/api/v1/products").then(res => res.json()),
      fetch("/api/v1/settings/huts").then(res => res.json()),
    ]);
    
    const packages = Array.isArray(packagesRes) ? packagesRes : (packagesRes.data || []);
    const products = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);
    const areas = Array.isArray(areasRes) ? areasRes : (areasRes.data || []);
    
    await syncMasterDataToOffline(packages, products, areas);
  } catch (error) {
    console.error("OfflineProvider: Failed to fetch master data", error);
  }
};

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { setIsOffline, setConnectionStatus } = useUIStore();
  const queryClient = useQueryClient();

  const syncPendingData = useCallback(async () => {
    if (!navigator.onLine) return;

    setConnectionStatus("reconnecting");
    let hasSynced = false;

    try {
      const pendingSessions = await offlineDB.sessions.where("syncStatus").equals("PENDING").toArray();
      
      for (const session of pendingSessions) {
        try {
          const products = await offlineDB.invoiceItems.where("sessionId").equals(session.id).toArray();
          
          await sessionService.createSession({
            areaId: session.areaId,
            startTime: session.startTime,
            customerId: session.customerId,
            customer_name: session.customerName,
            phone: session.customerPhone,
            hourlyRate: session.hourlyRate,
            packageId: session.packageId,
            prepaidAmount: session.prepaidAmount || 0,
            products: products.map(p => ({
              productId: p.productId!,
              quantity: p.quantity,
              unitPrice: p.unitPrice
            })),
          });

          await offlineDB.sessions.delete(session.id);
          for (const prod of products) {
            await offlineDB.invoiceItems.delete(prod.id);
          }
          hasSynced = true;
        } catch (error) {
          console.error("Failed to sync session:", session.id, error);
        }
      }

      if (hasSynced) {
        toast.success("Đã đồng bộ dữ liệu offline lên máy chủ");
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["huts"] });
      }

      setConnectionStatus("stable");
      setIsOffline(false);
    } catch (error) {
      console.error("Sync error:", error);
      setConnectionStatus("stable");
    }
  }, [setConnectionStatus, setIsOffline, queryClient]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Đã có mạng. Đang đồng bộ...");
      syncPendingData();
      fetchMasterData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("Mất kết nối mạng. Bạn đang ở chế độ Offline (Dữ liệu sẽ được lưu cục bộ).");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      fetchMasterData();
      syncPendingData();
    }

    const interval = setInterval(() => {
      if (navigator.onLine) {
        fetchMasterData();
        syncPendingData();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [setIsOffline, syncPendingData]);

  return <>{children}</>;
}
