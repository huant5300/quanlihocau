import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { cache } from "react";

export const getActiveLakeId = cache(async () => {
  try {
    const session = await auth();
    
    const cookieStore = await cookies();
    const cookieLakeId = cookieStore.get("lakeId")?.value;

    // Tenant context must never be derived for an unauthenticated request.
    if (!session?.user) {
      return "";
    }

    const { id: userId, role, lakeId: userLakeId } = session.user;

    // 2. For STAFF / CASHIER: Hard-locked to their assigned lakeId!
    if (role === UserRole.STAFF || role === UserRole.CASHIER) {
      if (userLakeId) return userLakeId;
      const assignedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { lakeId: true }
      }).catch(() => null);
      if (assignedUser?.lakeId) return assignedUser.lakeId;
      return "";
    }

    // 3. For OWNER: Can switch lakes, but must only access their own managed lakes!
    if (role === UserRole.OWNER) {
      if (cookieLakeId) {
        const isLakeOwner = await prisma.fishingLake.findFirst({
          where: { id: cookieLakeId, managerId: userId }
        }).catch(() => null);
        if (isLakeOwner) return cookieLakeId;
      }

      if (userLakeId) {
        return userLakeId;
      }
      
      const firstManagedLake = await prisma.fishingLake.findFirst({
        where: { managerId: userId }
      }).catch(() => null);
      if (firstManagedLake) return firstManagedLake.id;

      const assignedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { lakeId: true }
      }).catch(() => null);
      if (assignedUser?.lakeId) return assignedUser.lakeId;

      return "";
    }

    // 4. For SUPER_ADMIN: Can access any lake
    if (cookieLakeId) return cookieLakeId;
    if (userLakeId) return userLakeId;
    return "";
  } catch (err) {
    console.error("getActiveLakeId error (returning fallback):", err);
    return "";
  }
});

export async function setActiveLakeId(lakeId: string) {
  const cookieStore = await cookies();
  cookieStore.set("lakeId", lakeId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  });
}
