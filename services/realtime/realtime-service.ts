import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/stores/ui-store";
import type { SupabaseClient } from "@supabase/supabase-js";

export class RealtimeService {
  private _supabase: SupabaseClient | null = null;
  private get supabase(): SupabaseClient {
    if (!this._supabase) this._supabase = createClient() as unknown as SupabaseClient;
    return this._supabase;
  }

  subscribeToSessions(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel("active-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        const { setConnectionStatus } = useUIStore.getState();
        setConnectionStatus(status === "SUBSCRIBED" ? "stable" : "reconnecting");
      });

    return channel;
  }

  unsubscribe(channel: any) {
    this.supabase.removeChannel(channel);
  }
}

export const realtimeService = new RealtimeService();
