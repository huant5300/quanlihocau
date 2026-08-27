import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const DEFAULT_PACKAGES = [
  { id: "pkg_3h", name: "Gói 3 Tiếng", durationHours: 3, price: 150000, isActive: true },
  { id: "pkg_5h", name: "Gói 5 Tiếng", durationHours: 5, price: 200000, isActive: true },
  { id: "pkg_8h", name: "Gói 8 Tiếng", durationHours: 8, price: 300000, isActive: true },
  { id: "pkg_12h", name: "Gói Câu Đêm (12h)", durationHours: 12, price: 400000, isActive: true },
];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(DEFAULT_PACKAGES, { status: 200 });
    }

    let packages = await prisma.fishingPackage.findMany({
      orderBy: { durationHours: "asc" }
    }).catch(() => []);

    // Auto-seed default packages if none exist
    if (packages.length === 0) {
      for (const p of DEFAULT_PACKAGES) {
        await prisma.fishingPackage.upsert({
          where: { id: p.id },
          update: {},
          create: p,
        }).catch(() => null);
      }

      packages = await prisma.fishingPackage.findMany({
        orderBy: { durationHours: "asc" }
      }).catch(() => DEFAULT_PACKAGES as any);
    }
    
    return NextResponse.json(packages.length > 0 ? packages : DEFAULT_PACKAGES, { status: 200 });
  } catch (error: any) {
    console.error("[Get Packages Fallback]:", error.message);
    return NextResponse.json(DEFAULT_PACKAGES, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    const isOwner = session?.user?.role === "OWNER";

    if (!session || (!isOwner && !isSuperAdmin)) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
    }

    const body = await req.json();
    const pkg = await prisma.fishingPackage.create({
      data: {
        id: body.id || `pkg_${Date.now()}`,
        name: body.name || "Gói câu mới",
        durationHours: parseFloat(body.durationHours) || 3,
        price: parseFloat(body.price) || 100000,
        isActive: true
      }
    });

    return NextResponse.json(pkg);
  } catch (error: any) {
    console.error("[Create Package Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi tạo gói câu" }, { status: 400 });
  }
}
