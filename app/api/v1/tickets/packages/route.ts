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

    let packages = await prisma.fishingPackage.findMany({
      where: { isActive: true },
      orderBy: { durationHours: "asc" }
    }).catch(() => []);

    // Auto-seed default packages if none exist
    if (!packages || packages.length === 0) {
      const defaultPackages = [
        { id: "pkg_3h", name: "Gói 3 Tiếng", durationHours: 3, price: 150000, isActive: true },
        { id: "pkg_5h", name: "Gói 5 Tiếng", durationHours: 5, price: 200000, isActive: true },
        { id: "pkg_8h", name: "Gói 8 Tiếng", durationHours: 8, price: 300000, isActive: true },
        { id: "pkg_12h", name: "Gói Câu Đêm (12h)", durationHours: 12, price: 400000, isActive: true },
      ];

      for (const p of defaultPackages) {
        await prisma.fishingPackage.upsert({
          where: { id: p.id },
          update: {},
          create: p,
        }).catch(() => null);
      }

      packages = await prisma.fishingPackage.findMany({
        where: { isActive: true },
        orderBy: { durationHours: "asc" }
      }).catch(() => []);
    }
    
    return NextResponse.json(packages || []);
  } catch (error: any) {
    console.error("API /api/v1/tickets/packages error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
