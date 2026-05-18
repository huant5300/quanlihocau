import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { DashboardClient } from "./dashboard-client";
import { eachDayOfInterval, format, subDays } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
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
    sevenDaysTransactions,
    spotsCount
  ] = await Promise.all([
    // 1. Active sessions
    prisma.fishingSession.count({
      where: {
        lakeId,
        status: "ACTIVE"
      }
    }),
    // 2. Today's revenue
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
    // 6. 7-day transactions
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
    }),
    // 7. Spot capacity
    prisma.fishingArea.count({
      where: {
        lakeId
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

  const initialData = {
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
  };

  return <DashboardClient initialData={initialData} />;
}
