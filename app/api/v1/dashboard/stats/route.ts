import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { eachDayOfInterval, format } from "date-fns";
import { getVnStartOfToday, getVnStartOfWeek, getVnStartOfMonth, getVnStartOfYear, getVnSubDays } from "@/utils/datetime";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "today"; // today, week, month, year

    const today = getVnStartOfToday();

    // Calculate period start date
    let periodStart: Date;
    switch (period) {
      case "week":
        periodStart = getVnStartOfWeek(today);
        break;
      case "month":
        periodStart = getVnStartOfMonth(today);
        break;
      case "year":
        periodStart = getVnStartOfYear(today);
        break;
      default:
        periodStart = today;
    }

    const startOf7Days = getVnSubDays(today, 6);

    const [
      activeSessions,
      periodTransactions,
      totalCustomers,
      todayCatchesCountVal,
      recentTransactions,
      sevenDaysTransactions,
      monthlyCatches,
      spotsCount,
      periodSessionCount,
      periodPayments,
    ] = await Promise.all([
      // 1. Active sessions
      prisma.fishingSession.count({
        where: { lakeId, status: "ACTIVE" }
      }),
      // 2. Period transactions (for revenue breakdown)
      prisma.transaction.findMany({
        where: {
          lakeId,
          type: "INCOME",
          createdAt: { gte: periodStart }
        },
        select: {
          amount: true,
          category: true,
          paymentMethod: true,
          createdAt: true,
        }
      }),
      // 3. Total customers
      prisma.customer.count({ where: { lakeId } }),
      // 4. Fish catches today count
      prisma.fishCatch.count({
        where: {
          createdAt: { gte: today },
          session: { lakeId }
        }
      }),
      // 5. Recent transactions
      prisma.transaction.findMany({
        where: { lakeId },
        take: 5,
        orderBy: { createdAt: "desc" }
      }),
      // 6. 7-day income transactions
      prisma.transaction.findMany({
        where: {
          lakeId,
          type: "INCOME",
          createdAt: { gte: startOf7Days }
        },
        select: { amount: true, createdAt: true, category: true }
      }),
      // 7. Fish catches in the last 30 days
      prisma.fishCatch.findMany({
        where: {
          createdAt: { gte: getVnSubDays(today, 30) },
          session: { lakeId }
        },
        include: { fishType: true }
      }),
      // 8. Spot capacity (areas)
      prisma.fishingArea.count({ where: { lakeId } }),
      // 9. Session count in period
      prisma.fishingSession.count({
        where: {
          lakeId,
          createdAt: { gte: periodStart }
        }
      }),
      // 10. Payment method breakdown
      prisma.payment.findMany({
        where: {
          createdAt: { gte: periodStart },
          invoice: { lakeId }
        },
        select: {
          amount: true,
          method: true,
        }
      }),
    ]);

    // Revenue breakdown by category and payment method
    const totalRevenue = periodTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const ticketRevenue = periodTransactions
      .filter(t => t.category === "SESSION")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const productRevenue = periodTransactions
      .filter(t => t.category === "PRODUCT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Payment method breakdown
    const cashRevenue = periodPayments
      .filter(p => p.method === "CASH")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const transferRevenue = periodPayments
      .filter(p => p.method === "TRANSFER")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Group catches by fish type
    const fishTypeGroups: Record<string, number> = {};
    monthlyCatches.forEach(c => {
      const name = c.fishType?.name || "Cá khác";
      fishTypeGroups[name] = (fishTypeGroups[name] || 0) + 1;
    });
    const topCatches = Object.entries(fishTypeGroups)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 7-day daily trend
    const days = eachDayOfInterval({ start: startOf7Days, end: new Date() });
    const revenueChart = days.map(day => {
      const dayStr = format(day, "dd/MM");
      const dayTotal = sevenDaysTransactions
        .filter(t => format(new Date(t.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const dayTickets = sevenDaysTransactions
        .filter(t => format(new Date(t.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") && t.category === "SESSION")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { date: dayStr, amount: dayTotal, tickets: dayTickets };
    });

    // Customer count in period
    const periodCustomerCount = await prisma.customer.count({
      where: {
        lakeId,
        createdAt: { gte: periodStart }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        activeSessions,
        todayRevenue: totalRevenue,
        totalRevenue,
        ticketRevenue,
        productRevenue,
        cashRevenue,
        transferRevenue,
        totalCustomers,
        periodCustomerCount,
        todayCatchesCount: todayCatchesCountVal,
        periodSessionCount,
        topCatches,
        spotsCount,
        revenueChart,
        period,
        recentTransactions: recentTransactions.map(tx => ({
          id: tx.id,
          amount: Number(tx.amount),
          type: tx.type,
          category: tx.category,
          description: tx.description || "Giao dịch hệ thống",
          createdAt: tx.createdAt.toISOString()
        }))
      }
    });
  } catch (error: any) {
    console.error("Dashboard Stats GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
