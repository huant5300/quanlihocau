import { MainLayout } from "@/components/layouts/main-layout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { HeartbeatProvider } from "@/providers/heartbeat-provider";
import { getActiveLakeId } from "@/lib/lake-context";
import { getLakeSubscription } from "@/utils/saas-helpers";
import { SubscriptionBlocker } from "@/components/shared/subscription-blocker";
import { UserRole } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let isExpired = false;
  let planName = "";
  let expiryDate: string | null = null;

  if (session.user.role !== UserRole.SUPER_ADMIN) {
    const lakeId = await getActiveLakeId();
    if (lakeId) {
      const sub = await getLakeSubscription(lakeId);
      isExpired = sub.isExpired;
      planName = sub.limits.name;
      expiryDate = sub.expiresAt ? sub.expiresAt.toISOString() : null;
    }
  }

  return (
    <HeartbeatProvider>
      <MainLayout>
        <SubscriptionBlocker isExpired={isExpired} planName={planName} expiryDate={expiryDate}>
          {children}
        </SubscriptionBlocker>
      </MainLayout>
    </HeartbeatProvider>
  );
}
