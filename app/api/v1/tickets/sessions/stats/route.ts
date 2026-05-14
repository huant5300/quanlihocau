import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    
    // 1. Count active sessions
    const activeCount = await prisma.fishingSession.count({
      where: { 
        lakeId,
        status: "ACTIVE"
      }
    });

    // 2. Today's revenue (from completed invoices today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: today },
        invoice: {
          session: { lakeId }
        }
      }
    });

    const todayRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 3. Customer count
    const customerCount = await prisma.customer.count({
      where: { lakeId }
    });

    // 4. Low stock count
    const lowStockCount = await prisma.product.count({
      where: { 
        lakeId,
        stock: { lte: 10 }
      }
    });

    return NextResponse.json({
      activeCount,
      todayRevenue,
      customerCount,
      lowStockCount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
