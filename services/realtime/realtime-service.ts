import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/stores/ui-store";

export class RealtimeService {
  private supabase = createClient();

  subscribeToSessions(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel("active-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          console.log("Realtime session update:", payload);
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
