"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile, AuthStatus, mapUserToProfile } from "@/types/auth/auth.types";
import { useAuthStore } from "@/stores/auth-store";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserProfile | null;
  status: AuthStatus;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const supabase = createClient();
  const { setUser: setStoreUser } = useAuthStore();

  useEffect(() => {
    // 1. Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = mapUserToProfile(session.user);
          setUser(profile);
          setStoreUser(profile);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Init Auth Error:", error);
        setStatus("unauthenticated");
      }
    };

    initAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const profile = mapUserToProfile(session.user);
          setUser(profile);
          setStoreUser(profile);
          setStatus("authenticated");
        } else {
          setUser(null);
          setStoreUser(null);
          setStatus("unauthenticated");
        }
      }
    );

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
