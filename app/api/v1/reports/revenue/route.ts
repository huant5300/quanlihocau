import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    
    // Simple revenue report for the current week
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    
    const invoices = await prisma.invoice.findMany({
      where: {
        session: { lakeId },
        status: "PAID",
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    });

    const days = eachDayOfInterval({ start, end });
    const stats = days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTotal = invoices
        .filter(inv => format(inv.createdAt, "yyyy-MM-dd") === dayStr)
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      
      return {
        date: dayStr,
        revenue: dayTotal
      };
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
