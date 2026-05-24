import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const catches = await prisma.fishCatch.findMany({
      include: {
        fishType: true,
        session: {
          include: {
            area: true,
            customer: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(catches);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
