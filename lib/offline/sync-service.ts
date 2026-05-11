import { db, OfflineAction } from "./db";
import { toast } from "sonner";
import { sessionService } from "@/services/api/session-service";
import { productService } from "@/services/api/product-service";

export class SyncService {
  private static isSyncing = false;

  /**
   * Add an action to the offline queue
   */
  static async enqueueAction(type: any, payload: any) {
    const actionId = await db.syncQueue.add({
      type,
      payload,
      timestamp: Date.now(),
      status: "PENDING",
      retryCount: 0,
    });

    // Try to sync immediately if online
    if (typeof navigator !== "undefined" && navigator.onLine) {
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
    if (typeof navigator === "undefined" || !navigator.onLine || this.isSyncing) return;

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
   * Actual logic to sync a single action with Django API
   */
  private static async syncAction(action: OfflineAction) {
    switch (action.type) {
      case "CREATE_SESSION":
        await sessionService.createSession(action.payload as any);
        break;

      case "PAYMENT":
        // Implement payment sync if needed
        break;

      case "UPDATE_PRODUCT":
        if (!("id" in action.payload)) {
          throw new Error("Thiếu id sản phẩm để cập nhật.");
        }
        const { id, ...updateData } = action.payload as any;
        await productService.updateProduct(id, updateData);
        break;
    }
  }

  /**
   * Initialize listeners for online/offline status
   */
  static init() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      toast.success("Đã có kết nối internet. Đang đồng bộ...");
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      toast.warning("Bạn đang ở chế độ ngoại tuyến.");
    });
  }
}
