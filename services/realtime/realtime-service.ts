import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/stores/ui-store";
import { useOfflineStore } from "@/stores/offline-store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FishingSession } from "@/modules/sessions/types/session.types";
import { toast } from "sonner";

export class RealtimeService {
  private _supabase: SupabaseClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private channels: Map<string, any> = new Map();

  private get supabase(): SupabaseClient {
    if (!this._supabase) this._supabase = createClient() as unknown as SupabaseClient;
    return this._supabase;
  }

  subscribeToSessions(callback: (payload: any) => void) {
    const channelName = "active-sessions";
    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        this.handleConnectionStatus(status, channelName);
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToSessionUpdates(sessionId: string, callback: (payload: any) => void) {
    const channelName = `session-${sessionId}`;
    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        this.handleConnectionStatus(status, channelName);
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToPayments(callback: (payload: any) => void) {
    const channelName = "payments";
    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        this.handleConnectionStatus(status, channelName);
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToProducts(callback: (payload: any) => void) {
    const channelName = "products";
    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        this.handleConnectionStatus(status, channelName);
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  private handleConnectionStatus(status: string, channelName: string) {
    const { setConnectionStatus } = useUIStore.getState();
    const { isOnline } = useOfflineStore.getState();

    if (status === "SUBSCRIBED") {
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      setConnectionStatus("stable");
      console.log(`Realtime channel ${channelName} connected`);
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      setConnectionStatus("reconnecting");
      this.handleReconnect(channelName);
    } else if (status === "CLOSED") {
      console.log(`Realtime channel ${channelName} closed`);
    }
  }

  private async handleReconnect(channelName: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error("Không thể kết nối realtime. Vui lòng kiểm tra kết nối mạng.");
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect ${channelName} (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      const channel = this.channels.get(channelName);
      if (channel) {
        this.supabase.removeChannel(channel);
        // Re-subscribe logic would go here, but for now we'll rely on component re-mount
      }
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Exponential backoff, max 30s
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll() {
    for (const [name, channel] of this.channels) {
      this.supabase.removeChannel(channel);
    }
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
