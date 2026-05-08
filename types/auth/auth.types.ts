import { User } from "@supabase/supabase-js";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AppUser extends User {
  role?: string;
  tenant_id?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: AppUser | null;
  status: AuthStatus;
  error: string | null;
}
