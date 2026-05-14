import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function getActiveLakeId() {
  const cookieStore = await cookies();
  const cookieLakeId = cookieStore.get("lakeId")?.value;
  
  if (cookieLakeId) return cookieLakeId;

  // Fallback: Get the first lake from the database
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
