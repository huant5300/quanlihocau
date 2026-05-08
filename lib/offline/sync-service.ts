import { db, OfflineAction } from "./db";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export class SyncService {
  private static isSyncing = false;
  private static _supabase: ReturnType<typeof createClient> | null = null;
  private static get supabase() {
    if (!this._supabase) this._supabase = createClient();
    return this._supabase;
  }

  /**
   * Add an action to the offline queue
   */
  static async enqueueAction(type: OfflineAction["type"], payload: any) {
    const actionId = await db.syncQueue.add({
      type,
      payload,
      timestamp: Date.now(),
      status: "PENDING",
      retryCount: 0,
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    } else {
      toast.info("Đang ngoại tuyến. Hành động đã được lưu vào hàng chờ.");
    }

    return actionId;
  }

  /**
   * Process all pending actions in the queue
   */
  static async processQueue() {
    if (this.isSyncing || !navigator.onLine) return;
    
    const pendingActions = await db.syncQueue
      .where("status")
      .equals("PENDING")
      .toArray();

    if (pendingActions.length === 0) return;

    this.isSyncing = true;
    console.log(`Starting sync for ${pendingActions.length} actions...`);

    for (const action of pendingActions) {
      try {
        await db.syncQueue.update(action.id!, { status: "SYNCING" });
        await this.syncAction(action);
        await db.syncQueue.delete(action.id!);
      } catch (error) {
        console.error(`Sync failed for action ${action.id}:`, error);
        await db.syncQueue.update(action.id!, { 
          status: "PENDING", 
          retryCount: action.retryCount + 1 
        });
      }
    }

    this.isSyncing = false;
    toast.success("Đã đồng bộ hóa dữ liệu ngoại tuyến.");
  }

  /**
   * Actual logic to sync a single action with Supabase
   */
  private static async syncAction(action: OfflineAction) {
    switch (action.type) {
      case "CREATE_SESSION":
        const { error: sessionErr } = await this.supabase
          .from("sessions")
          .insert([action.payload]);
        if (sessionErr) throw sessionErr;
        break;

      case "PAYMENT":
        const { error: paymentErr } = await this.supabase
          .from("payments")
          .insert([action.payload]);
        if (paymentErr) throw paymentErr;
        break;

      case "UPDATE_PRODUCT":
        const { error: productErr } = await this.supabase
          .from("products")
          .update(action.payload)
          .eq("id", action.payload.id);
        if (productErr) throw productErr;
        break;
    }
  }

  /**
   * Initialize listeners for online/offline status
   */
  static init() {
    window.addEventListener("online", () => {
      toast.success("Đã có kết nối internet. Đang đồng bộ...");
      this.processQueue();
    });
    
    window.addEventListener("offline", () => {
      toast.warning("Bạn đang ở chế độ ngoại tuyến.");
    });
  }
}
