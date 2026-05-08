"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppUser, AuthStatus } from "@/types/auth/auth.types";
import { useAuthStore } from "@/stores/auth-store";

interface AuthContextType {
  user: AppUser | null;
  status: AuthStatus;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const supabase = createClient();
  const { setUser: setStoreUser } = useAuthStore();

  useEffect(() => {
    // 1. Get initial session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const appUser = session.user as AppUser;
        setUser(appUser);
        setStoreUser(appUser);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    };

    initAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      if (session?.user) {
        const appUser = session.user as AppUser;
        setUser(appUser);
        setStoreUser(appUser);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStoreUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setStoreUser]);

  return (
    <AuthContext.Provider value={{ user, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
