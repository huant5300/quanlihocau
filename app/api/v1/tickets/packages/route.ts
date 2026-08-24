import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return NextResponse.json({ success: false, message: "Lake ID not found" }, { status: 400 });
    }

    const packages = await prisma.fishingPackage.findMany({
      where: { isActive: true },
      orderBy: { durationHours: "asc" }
    }).catch((err) => {
      console.error("Prisma packages query error (returning empty array):", err);
      return [];
    });
    
    return NextResponse.json(packages || []);
  } catch (error: any) {
    console.error("API /api/v1/tickets/packages error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
