import { MainLayout } from "@/components/layouts/main-layout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <MainLayout>{children}</MainLayout>;
}
