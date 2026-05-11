"use client";

import React from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
