"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AuthService {
  private _supabase: SupabaseClient | null = null;
  private get supabase(): SupabaseClient {
    if (!this._supabase) this._supabase = createClient() as unknown as SupabaseClient;
    return this._supabase;
  }

  async signInWithGoogle() {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Lỗi đăng nhập", {
        description: error.message || "Không thể kết nối với Google.",
      });
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (error: any) {
      toast.error("Lỗi đăng xuất", { description: error.message });
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) return null;
    return user;
  }
}

export const authService = new AuthService();
