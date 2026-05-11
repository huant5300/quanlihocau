"use client";

import { useAuthStore } from "@/stores/auth-store";
import { axiosApiClient } from "@/services/api/axios-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth/auth.types";

export function useAuth() {
  const { user, setUser, setTokens, setLoading, logout: clearStore } = useAuthStore();
  const router = useRouter();

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      // Django standard JWT endpoint
      const response = await axiosApiClient.post<any>("/api/token/", {
        username,
        password,
      });

      if (response.success && response.data?.access) {
        const { access, refresh } = response.data;
        setTokens({ access, refresh });
        
        // Fetch user profile immediately after getting the token
        const profileRes = await axiosApiClient.get<any>("/api/v1/users/me/");
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          toast.success("Đăng nhập thành công");
          router.push("/dashboard");
        } else {
          toast.error(profileRes.error?.message || "Không thể tải thông tin người dùng");
        }
      } else {
        toast.error(response.error?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStore();
    router.push("/login");
    toast.success("Đã đăng xuất thành công");
  };

  const hasRole = (roles: UserRole[]) => {
    return user && roles.includes(user.role);
  };

  const loginWithGoogle = async (access_token: string) => {
    try {
      setLoading(true);
      // Send token to backend
      const response = await axiosApiClient.post<any>("/dj-rest-auth/google/", {
        access_token,
      });

      if (response.success && response.data?.access) {
        const { access, refresh } = response.data;
        setTokens({ access, refresh });
        
        // Fetch user profile immediately after getting the token
        const profileRes = await axiosApiClient.get<any>("/api/v1/users/me/");
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          toast.success("Đăng nhập Google thành công");
          router.push("/dashboard");
        } else {
          toast.error(profileRes.error?.message || "Không thể tải thông tin người dùng");
        }
      } else {
        toast.error(response.error?.message || "Xác thực Google thất bại");
      }
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error("Google Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading: useAuthStore((state) => state.isLoading),
    login,
    loginWithGoogle,
    logout,
    hasRole,
  };
}
