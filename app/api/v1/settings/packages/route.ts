import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let packages = await prisma.fishingPackage.findMany({
      orderBy: { durationHours: "asc" }
    });

    // Auto-seed default packages if none exist
    if (packages.length === 0) {
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
        orderBy: { durationHours: "asc" }
      });
    }
    
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.email === "huant5300@gmail.com";
    const isOwner = session?.user?.role === "OWNER";

    if (!session || (!isOwner && !isSuperAdmin)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const pkg = await prisma.fishingPackage.create({
      data: {
        id: body.id || `pkg_${Date.now()}`,
        name: body.name,
        durationHours: parseFloat(body.durationHours),
        price: parseFloat(body.price),
        isActive: true
      }
    });

    return NextResponse.json(pkg);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
