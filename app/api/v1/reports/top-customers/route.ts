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
    
    // Top customers by total spent
    const customers = await prisma.customer.findMany({
      where: { lakeId },
      orderBy: { totalSpent: "desc" },
      take: 5,
      select: {
        fullName: true,
        totalSpent: true,
        visitCount: true
      }
    });

    const stats = customers.map(c => ({
      name: c.fullName,
      totalSpent: Number(c.totalSpent),
      visits: c.visitCount
    }));

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
