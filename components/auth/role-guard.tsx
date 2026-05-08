"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types/auth";
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
  fallbackPath = "/unauthorized" 
}: RoleGuardProps) {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  if (!hasRole(allowedRoles)) {
    redirect(fallbackPath);
  }

  return <>{children}</>;
}
