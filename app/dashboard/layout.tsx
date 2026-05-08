"use client";

import { MainLayout } from "@/components/layouts/main-layout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
