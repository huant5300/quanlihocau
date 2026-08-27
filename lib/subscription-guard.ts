import prisma from "@/lib/prisma";
import { SAAS_ERRORS } from "./errors";

export interface SubscriptionGuardResult {
  allowed: boolean;
  status: "ACTIVE" | "GRACE_PERIOD" | "EXPIRED" | "SUSPENDED";
  isGracePeriod: boolean;
  daysRemaining: number;
  error?: string;
  code?: string;
}

/**
 * Validates whether a fishing lake has write access based on subscription lifecycle (PRD.md Section 3.2)
 */
export async function checkLakeSubscriptionStatus(lakeId: string): Promise<SubscriptionGuardResult> {
  try {
    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!lake) {
      return {
        allowed: false,
        status: "EXPIRED",
        isGracePeriod: false,
        daysRemaining: 0,
        error: SAAS_ERRORS.ERR_MISSING_LAKE_CONTEXT.message,
        code: SAAS_ERRORS.ERR_MISSING_LAKE_CONTEXT.code,
      };
    }

    const now = new Date();
    const expiresAt = lake.subscriptionExpiresAt ? new Date(lake.subscriptionExpiresAt) : null;
    const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const rawStatus = (lake.subscriptionStatus as string) || "ACTIVE";

    // 1. Explicitly Suspended or Expired
    if (rawStatus === "SUSPENDED" || rawStatus === "EXPIRED") {
      return {
        allowed: false,
        status: rawStatus as any,
        isGracePeriod: false,
        daysRemaining,
        error: SAAS_ERRORS.ERR_SUBSCRIPTION_EXPIRED.message,
        code: SAAS_ERRORS.ERR_SUBSCRIPTION_EXPIRED.code,
      };
    }

    // 2. Check if past expiration date
    if (expiresAt && expiresAt < now) {
      const daysOverdue = Math.abs(daysRemaining);
      // Grace period allows 3 days buffer (PRD Section 3.1)
      if (daysOverdue <= 3) {
        return {
          allowed: true,
          status: "GRACE_PERIOD",
          isGracePeriod: true,
          daysRemaining: -daysOverdue,
        };
      } else {
        // Expired beyond grace period
        return {
          allowed: false,
          status: "EXPIRED",
          isGracePeriod: false,
          daysRemaining,
          error: SAAS_ERRORS.ERR_SUBSCRIPTION_EXPIRED.message,
          code: SAAS_ERRORS.ERR_SUBSCRIPTION_EXPIRED.code,
        };
      }
    }

    return {
      allowed: true,
      status: "ACTIVE",
      isGracePeriod: false,
      daysRemaining,
    };
  } catch (err: any) {
    console.error("[Subscription Guard Error]:", err.message);
    // Fail-open for transient DB errors so normal operations aren't blocked on network hiccups
    return {
      allowed: true,
      status: "ACTIVE",
      isGracePeriod: false,
      daysRemaining: 999,
    };
  }
}

/**
 * Throws or returns error if lake does not have write permissions
 */
export async function assertLakeWriteAccess(lakeId: string) {
  const result = await checkLakeSubscriptionStatus(lakeId);
  if (!result.allowed) {
    return {
      success: false,
      error: result.error || SAAS_ERRORS.ERR_SUBSCRIPTION_EXPIRED.message,
      code: result.code || "ERR_SUBSCRIPTION_EXPIRED",
    };
  }
  return { success: true };
}
