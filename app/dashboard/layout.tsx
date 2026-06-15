import { MainLayout } from "@/components/layouts/main-layout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { HeartbeatProvider } from "@/providers/heartbeat-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <HeartbeatProvider>
      <MainLayout>{children}</MainLayout>
    </HeartbeatProvider>
  );
}
