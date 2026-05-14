"use client";

import React from "react";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuthSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect(fallbackPath);
  }

  return <>{children}</>;
}
