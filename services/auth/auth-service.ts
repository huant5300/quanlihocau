"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export class AuthService {
  private supabase = createClient();

  async signInWithGoogle() {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error("Lỗi đăng nhập", {
        description: error.message || "Không thể kết nối với Google."
      });
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (error: any) {
      toast.error("Lỗi đăng xuất", {
        description: error.message
      });
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) return null;
    return user;
  }
}

export const authService = new AuthService();
