import { cookies } from "next/headers";

export async function getActiveLakeId() {
  const cookieStore = await cookies();
  return cookieStore.get("lakeId")?.value || "lake_01"; // Default to lake_01 if none set
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
