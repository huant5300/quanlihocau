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
    const huts = await prisma.fishingArea.findMany({
      where: { lakeId },
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json(huts);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
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
