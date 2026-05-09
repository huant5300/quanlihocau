import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export class BaseService {
  private _supabase: SupabaseClient | null = null;

  protected get supabase(): SupabaseClient {
    if (!this._supabase) {
      this._supabase = createClient() as unknown as SupabaseClient;
    }
    return this._supabase;
  }


  protected handleError(error: unknown, context: string) {
    const msg = error instanceof Error ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại.";
    console.error(`Error in ${context}:`, error);
    toast.error(`Lỗi hệ thống: ${context}`, { description: msg });
    throw error;
  }
}
