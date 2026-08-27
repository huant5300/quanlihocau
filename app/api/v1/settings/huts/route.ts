import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

import { checkResourceLimit } from "@/utils/saas-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();

    if (!lakeId) {
      return NextResponse.json([]);
    }

    let huts = await prisma.fishingArea.findMany({
      where: { lakeId },
      orderBy: { name: "asc" }
    });

    // Auto-seed 10 initial spots if lake has no spots yet
    if (huts.length === 0) {
      const defaultSpots = Array.from({ length: 10 }, (_, i) => ({
        name: `Ô ${(i + 1).toString().padStart(2, "0")}`,
        lakeId: lakeId,
        hourlyRate: 50000,
        status: "AVAILABLE" as any,
        capacity: 1,
        minDuration: 1,
      }));

      await prisma.fishingArea.createMany({
        data: defaultSpots,
      }).catch(() => null);

      huts = await prisma.fishingArea.findMany({
        where: { lakeId },
        orderBy: { name: "asc" }
      });
    }
    
    return NextResponse.json(huts || []);
  } catch (error: any) {
    console.error("API /api/v1/settings/huts error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    const isOwner = session?.user?.role === "OWNER";

    if (!session || (!isOwner && !isSuperAdmin)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return NextResponse.json({ success: false, message: "Không tìm thấy hồ câu hoạt động" }, { status: 400 });
    }

    // Check SaaS Resource Limit
    const limitCheck = await checkResourceLimit(lakeId, "huts");
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, message: limitCheck.message }, { status: 403 });
    }

    const body = await req.json();

    const hut = await prisma.fishingArea.create({
      data: {
        lakeId: lakeId,
        name: body.name,
        hourlyRate: parseFloat(body.hourlyRate || 50000),
        status: "AVAILABLE",
        capacity: 1,
        minDuration: 1
      }
    });

    return NextResponse.json(hut);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
