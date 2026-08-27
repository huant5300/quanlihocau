import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";

export async function GET(req: NextRequest) {
  try {
    const session_auth = await auth();
    if (!session_auth?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let lakeId: string | null | undefined = await getActiveLakeId();
    if (!lakeId && session_auth.user.lakeId) {
      lakeId = session_auth.user.lakeId;
    }
    
    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst({
        where: { managerId: session_auth.user.id }
      });
      lakeId = firstLake?.id;
    }

    if (!lakeId) {
      return NextResponse.json({
        totalRevenue: 0,
        totalSessions: 0,
        activeSessions: 0,
        newCustomers: 0,
        revenueData: []
      });
    }

    const currentLakeId: string = lakeId;

    // Date range setup
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // 1. Total Revenue Today
    const todayInvoices = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        lakeId: currentLakeId,
        createdAt: { gte: today, lt: tomorrow },
        status: { notIn: ["VOID", "REFUNDED"] }
      }
    });
    const totalRevenue = Number(todayInvoices._sum?.totalAmount || 0);

    // 2. Total Sessions Today
    const totalSessions = await prisma.fishingSession.count({
      where: {
        lakeId: currentLakeId,
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    // 3. Active Sessions Right Now
    const activeSessions = await prisma.fishingSession.count({
      where: {
        lakeId: currentLakeId,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        endTime: null
      }
    });

    // 4. New Customers Today
    const newCustomers = await prisma.customer.count({
      where: {
        lakeId: currentLakeId,
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    // 5. Revenue Chart Data (Last 7 Days)
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        lakeId: currentLakeId,
        createdAt: { gte: sevenDaysAgo, lt: tomorrow },
        status: { notIn: ["VOID", "REFUNDED"] }
      },
      select: { totalAmount: true, createdAt: true }
    });

    // Group by date
    const revenueMap: Record<string, number> = {};
    
    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      revenueMap[dateStr] = 0;
    }

    // Populate actual revenue
    recentInvoices.forEach(inv => {
      const dateStr = inv.createdAt.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      if (revenueMap[dateStr] !== undefined) {
        revenueMap[dateStr] += Number(inv.totalAmount);
      }
    });

    const revenueData = Object.keys(revenueMap).map(date => ({
      date,
      revenue: revenueMap[date]
    }));

    return NextResponse.json({
      totalRevenue,
      totalSessions,
      activeSessions,
      newCustomers,
      revenueData
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
