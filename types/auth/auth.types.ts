import { User } from "@supabase/supabase-js";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type UserRole = "SUPER_ADMIN" | "OWNER" | "STAFF" | "Admin" | "Manager" | "Staff";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  full_name: string;
  avatar_url: string;
}

export interface AppUser extends User {
  profile?: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;
}

/**
 * Maps a Supabase User object to a clean UserProfile object
 */
export const mapUserToProfile = (user: User): UserProfile => {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    role: (metadata.role as UserRole) || "STAFF",
    tenant_id: metadata.tenant_id || "default",
    full_name: metadata.full_name || user.email?.split("@")[0] || "Người dùng",
    avatar_url: metadata.avatar_url || "",
  };
};
