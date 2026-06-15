import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { FishStockClient } from "./fish-stock-client";

export default async function FishStockPage() {
  const session = await auth();
  const lakeId = await getActiveLakeId();

  const [fishStocks, fishTypes] = await Promise.all([
    prisma.fishStock.findMany({
      where: { lakeId },
      include: { fishType: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.fishType.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Enrich with caught data
  const enrichedStocks = await Promise.all(
    fishStocks.map(async (stock) => {
      const totalCaught = await prisma.fishCatch.aggregate({
        _sum: { weight: true },
        _count: true,
        where: {
          fishTypeId: stock.fishTypeId,
          session: { lakeId },
        },
      });
      return {
        id: stock.id,
        fishTypeId: stock.fishTypeId,
        fishTypeName: stock.fishType.name,
        initialWeight: Number(stock.initialWeight),
        initialQuantity: stock.initialQuantity,
        currentWeight: Number(stock.currentWeight),
        currentQuantity: stock.currentQuantity,
        deadCount: stock.deadCount,
        addedCount: stock.addedCount,
        addedWeight: Number(stock.addedWeight),
        caughtWeight: Number(totalCaught._sum.weight || 0),
        caughtCount: totalCaught._count || 0,
        notes: stock.notes,
        updatedAt: stock.updatedAt.toISOString(),
      };
    })
  );

  const serializedFishTypes = fishTypes.map((ft) => ({
    id: ft.id,
    name: ft.name,
    buybackPrice: Number(ft.buybackPrice),
  }));

  return (
    <FishStockClient
      initialStocks={enrichedStocks}
      fishTypes={serializedFishTypes}
    />
  );
}
