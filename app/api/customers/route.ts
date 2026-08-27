import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let lakeId = (await getActiveLakeId()) || session.user.lakeId;
    if (!lakeId && session.user.id) {
      const userLake = await prisma.fishingLake.findFirst({
        where: { managerId: session.user.id }
      });
      lakeId = userLake?.id;
    }
    if (!lakeId) {
      return NextResponse.json({ success: false, message: "Không tìm thấy hồ câu hoạt động" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const customers = await prisma.customer.findMany({
      where: {
        lakeId,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("[Customers API Error]:", error);
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
}
