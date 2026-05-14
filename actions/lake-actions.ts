"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { setActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";

import { UserRole } from "@prisma/client";

export async function switchLake(lakeId: string) {
  await setActiveLakeId(lakeId);
  revalidatePath("/dashboard");
  return { success: true };
}
export async function getMyLakes() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // If Super Admin, return all lakes
    if (session.user.role === UserRole.SUPER_ADMIN) {
      const lakes = await prisma.fishingLake.findMany({
        orderBy: { name: "asc" },
      });
      return { success: true, data: lakes };
    }

    // Otherwise return lakes managed by the user
    const lakes = await prisma.fishingLake.findMany({
      where: {
        managerId: session.user.id,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: lakes };
  } catch (error) {
    console.error("Error fetching lakes:", error);
    return { success: false, error: "Failed to fetch lakes" };
  }
}

export async function getLakeDetails(lakeId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
      include: {
        areas: true,
      },
    });
    return { success: true, data: lake };
  } catch (error) {
    return { success: false, error: "Failed to fetch lake details" };
  }
}
