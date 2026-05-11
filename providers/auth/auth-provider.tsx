"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types/auth/auth.types";
import { useAuthStore } from "@/stores/auth-store";
import { axiosApiClient } from "@/services/api/axios-client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: UserProfile | null;
  status: AuthStatus;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, tokens, setUser, logout, _hasHydrated } = useAuthStore();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isMounted, setIsMounted] = useState(false);

  // 1. Initial mount and hydration
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Ensure Zustand is hydrated from storage
        if (useAuthStore.persist?.rehydrate) {
          await useAuthStore.persist.rehydrate();
        }
      } catch (error) {
        console.error("Hydration failed:", error);
      } finally {
        setIsMounted(true);
      }
    };
    initAuth();

    // Fallback if hydration takes too long
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 2. Auth verification logic
  useEffect(() => {
    if (!isMounted || !_hasHydrated) return;

    const verifyAuth = async () => {
      // If we already have user and tokens, we are authenticated
      if (tokens?.access && user) {
        setStatus("authenticated");
        return;
      }

      // If we have tokens but no user, fetch the profile
      if (tokens?.access && !user) {
        try {
          const response = await axiosApiClient.get<UserProfile>("/api/v1/users/me/");
          if (response.success && response.data) {
            setUser(response.data);
            setStatus("authenticated");
          } else {
            logout();
            setStatus("unauthenticated");
          }
        } catch (error) {
          logout();
          setStatus("unauthenticated");
        }
        return;
      }

      // No tokens = unauthenticated
      setStatus("unauthenticated");
    };

    verifyAuth();
  }, [tokens?.access, user, setUser, logout, isMounted, _hasHydrated]);

  // 3. Handle logout/token removal
  useEffect(() => {
    if (isMounted && _hasHydrated && !tokens?.access) {
      setStatus("unauthenticated");
    }
  }, [tokens?.access, isMounted, _hasHydrated]);

  // Provide "loading" state during SSR and initial hydration to match exactly
  const contextValue = React.useMemo(() => {
    if (!isMounted || !_hasHydrated) {
      return { user: null, status: "loading" as AuthStatus };
    }
    return { user, status };
  }, [isMounted, _hasHydrated, user, status]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
