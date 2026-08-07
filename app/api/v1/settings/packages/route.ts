import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const packages = await prisma.fishingPackage.findMany({
      orderBy: { durationHours: "asc" }
    });
    
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
