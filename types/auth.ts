export type UserRole = "SUPER_ADMIN" | "OWNER" | "STAFF";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  tenant_id?: string; // For multi-tenant support
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
