"use client";

import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";

export function useAuth() {
  const supabase = createClient();
  const { user, setUser, setLoading, logout: clearStore } = useAuthStore();
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Không thể đăng nhập bằng Google");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearStore();
      router.push("/login");
      toast.success("Đã đăng xuất thành công");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi đăng xuất");
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roles: UserRole[]) => {
    return user && roles.includes(user.role);
  };

  return {
    user,
    isLoading: useAuthStore((state) => state.isLoading),
    loginWithGoogle,
    logout,
    hasRole,
  };
}
