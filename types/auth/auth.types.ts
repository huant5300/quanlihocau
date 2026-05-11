export type UserRole = "SUPER_ADMIN" | "OWNER" | "STAFF" | "CASHIER";

export type UUID = string;

export interface UserProfile {
  id: UUID;
  username: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserProfile;
}
