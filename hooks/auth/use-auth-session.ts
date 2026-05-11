"use client";

import { useAuthContext } from "@/providers/auth/auth-provider";
import { useMemo } from "react";

export function useAuthSession() {
  const { user, status } = useAuthContext();

  const isSuperAdmin = useMemo(() => user?.role === "SUPER_ADMIN", [user]);
  const isOwner = useMemo(() => user?.role === "OWNER", [user]);
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    user,
    status,
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    isOwner,
  };
}
