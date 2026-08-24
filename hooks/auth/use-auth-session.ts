"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useAuthSession() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const isSuperAdmin = useMemo(() => user?.role === "SUPER_ADMIN" || user?.email === "huant5300@gmail.com", [user]);
  const isOwner = useMemo(() => user?.role === "OWNER" || user?.role === "SUPER_ADMIN" || user?.email === "huant5300@gmail.com", [user]);
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    user,
    session,
    status,
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    isOwner,
  };
}
