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
    
    // Simple popular products report
    const products = await prisma.invoiceItem.groupBy({
      by: ['description'],
      where: {
        invoice: {
          session: { lakeId },
          status: "PAID"
        },
        productId: { not: null }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const stats = products.map(p => ({
      name: p.description,
      sales: p._sum.quantity || 0,
      revenue: Number(p._sum.totalPrice || 0)
    }));

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
