"use client";

import { useAuth } from "@/providers/auth/auth-provider";
import { useMemo } from "react";

export function useAuthSession() {
  const { user, status } = useAuth();

  const isAdmin = useMemo(() => user?.role === "Admin", [user]);
  const isManager = useMemo(() => user?.role === "Manager", [user]);
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id;

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin,
    isManager,
    tenantId,
  };
}
