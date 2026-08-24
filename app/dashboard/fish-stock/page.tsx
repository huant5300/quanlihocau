import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { FishStockClient } from "./fish-stock-client";

export default async function FishStockPage() {
  try {
    const session = await auth();
    const lakeId = await getActiveLakeId();

    const [fishStocks, fishTypes] = await Promise.all([
      prisma.fishStock.findMany({
        where: { lakeId: lakeId || "" },
        include: { fishType: true },
        orderBy: { updatedAt: "desc" },
      }).catch(() => []),
      prisma.fishType.findMany({
        orderBy: { name: "asc" },
      }).catch(() => []),
    ]);

    // Enrich with caught data
    const enrichedStocks = await Promise.all(
      (fishStocks || []).map(async (stock) => {
        let caughtWeight = 0;
        let caughtCount = 0;
        try {
          const totalCaught = await prisma.fishCatch.aggregate({
            _sum: { weight: true },
            _count: true,
            where: {
              fishTypeId: stock.fishTypeId,
              session: { lakeId: lakeId || "" },
            },
          });
          caughtWeight = Number(totalCaught._sum.weight || 0);
          caughtCount = totalCaught._count || 0;
        } catch {
          // ignore aggregate error
        }

        return {
          id: stock.id,
          fishTypeId: stock.fishTypeId,
          fishTypeName: stock.fishType?.name || "Cá chưa phân loại",
          initialWeight: Number(stock.initialWeight || 0),
          initialQuantity: stock.initialQuantity || 0,
          currentWeight: Number(stock.currentWeight || 0),
          currentQuantity: stock.currentQuantity || 0,
          deadCount: stock.deadCount || 0,
          addedCount: stock.addedCount || 0,
          addedWeight: Number(stock.addedWeight || 0),
          caughtWeight,
          caughtCount,
          notes: stock.notes || "",
          updatedAt: stock.updatedAt ? new Date(stock.updatedAt).toISOString() : new Date().toISOString(),
        };
      })
    );

    const serializedFishTypes = (fishTypes || []).map((ft) => ({
      id: ft.id,
      name: ft.name,
      buybackPrice: Number(ft.buybackPrice || 0),
    }));

    return (
      <FishStockClient
        initialStocks={enrichedStocks}
        fishTypes={serializedFishTypes}
      />
    );
  } catch (error) {
    console.error("FishStockPage error:", error);
    return <FishStockClient initialStocks={[]} fishTypes={[]} />;
  }
}
