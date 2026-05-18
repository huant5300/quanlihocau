import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { eachDayOfInterval, format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOf7Days = subDays(today, 6);

    const [
      activeSessions,
      todayRevenueAgg,
      totalCustomers,
      todayCatches,
      recentTransactions,
      sevenDaysTransactions
    ] = await Promise.all([
      // 1. Active sessions
      prisma.fishingSession.count({
        where: {
          lakeId,
          status: "ACTIVE"
        }
      }),
      // 2. Today's revenue from payments/transactions
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          lakeId,
          type: "INCOME",
          createdAt: { gte: today }
        }
      }),
      // 3. Total customers
      prisma.customer.count({
        where: {
          lakeId
        }
      }),
      // 4. Fish catches today
      prisma.fishCatch.findMany({
        where: {
          createdAt: { gte: today },
          session: {
            lakeId
          }
        },
        include: {
          fishType: true
        }
      }),
      // 5. Recent transactions
      prisma.transaction.findMany({
        where: {
          lakeId
        },
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
        select: {
          amount: true,
          createdAt: true
        }
      })
    ]);

    // Group catches by fish type and count the number of fish
    const fishTypeGroups: Record<string, number> = {};
    todayCatches.forEach(c => {
      const name = c.fishType?.name || "Cá khác";
      fishTypeGroups[name] = (fishTypeGroups[name] || 0) + 1;
    });

    const topCatches = Object.entries(fishTypeGroups)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const todayRevenue = Number(todayRevenueAgg._sum.amount || 0);
    const todayCatchesCount = todayCatches.length;

    // Fetch total capacity of lake spots (areas) to compute fill rate
    const spotsCount = await prisma.fishingArea.count({
      where: {
        lakeId
      }
    });

    // 7-day daily trend calculations
    const days = eachDayOfInterval({ start: startOf7Days, end: new Date() });
    const revenueChart = days.map(day => {
      const dayStr = format(day, "dd/MM");
      const dayTotal = sevenDaysTransactions
        .filter(t => format(new Date(t.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        date: dayStr,
        amount: dayTotal
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        activeSessions,
        todayRevenue,
        totalCustomers,
        todayCatchesCount,
        topCatches,
        spotsCount,
        revenueChart,
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
