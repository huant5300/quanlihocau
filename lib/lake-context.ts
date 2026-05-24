import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function getActiveLakeId() {
  const session = await auth();
  
  const cookieStore = await cookies();
  const cookieLakeId = cookieStore.get("lakeId")?.value;

  // 1. If not logged in, fallback to cookie or first lake in DB
  if (!session?.user) {
    if (cookieLakeId) return cookieLakeId;
    const firstLake = await prisma.fishingLake.findFirst();
    return firstLake?.id || "lake_01";
  }

  const { id: userId, role, lakeId: userLakeId } = session.user;

  // 2. For STAFF / CASHIER: Hard-locked to their assigned lakeId!
  // They cannot use cookies or switch to another lake.
  if (role === UserRole.STAFF || role === UserRole.CASHIER) {
    if (userLakeId) return userLakeId;
    // If somehow a staff has no lakeId, check database
    const assignedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { lakeId: true }
    });
    return assignedUser?.lakeId || "lake_01";
  }

  // 3. For OWNER: Can switch lakes, but must only access their own managed lakes!
  if (role === UserRole.OWNER) {
    if (cookieLakeId) {
      // Verify this Owner manages this lake
      const isLakeOwner = await prisma.fishingLake.findFirst({
        where: { id: cookieLakeId, managerId: userId }
      });
      if (isLakeOwner) return cookieLakeId;
    }
    
    // If no valid cookie, return their first managed lake
    const firstManagedLake = await prisma.fishingLake.findFirst({
      where: { managerId: userId }
    });
    return firstManagedLake?.id || "lake_01";
  }

  // 4. For SUPER_ADMIN: Can access any lake
  if (cookieLakeId) return cookieLakeId;
  const firstLake = await prisma.fishingLake.findFirst();
  return firstLake?.id || "lake_01";
}

export async function setActiveLakeId(lakeId: string) {
  const cookieStore = await cookies();
  cookieStore.set("lakeId", lakeId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  });
}
