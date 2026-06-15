"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordActivityLog } from "@/lib/activity-log";

export async function getFishStocksAction() {
  try {
    const lakeId = await getActiveLakeId();
    const stocks = await prisma.fishStock.findMany({
      where: { lakeId },
      include: { fishType: true },
      orderBy: { updatedAt: "desc" },
    });

    // Calculate caught fish from FishCatch records
    const enrichedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const totalCaught = await prisma.fishCatch.aggregate({
          _sum: { weight: true },
          _count: true,
          where: {
            fishTypeId: stock.fishTypeId,
            session: { lakeId },
          },
        });
        return {
          ...stock,
          initialWeight: Number(stock.initialWeight),
          initialQuantity: stock.initialQuantity,
          currentWeight: Number(stock.currentWeight),
          currentQuantity: stock.currentQuantity,
          addedWeight: Number(stock.addedWeight),
          caughtWeight: Number(totalCaught._sum.weight || 0),
          caughtCount: totalCaught._count || 0,
          fishTypeName: stock.fishType.name,
        };
      })
    );

    return { success: true, data: enrichedStocks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFishStockAction(data: {
  fishTypeId: string;
  initialWeight: number;
  initialQuantity: number;
  notes?: string;
}) {
  try {
    const session = await auth();
    const lakeId = await getActiveLakeId();

    const stock = await prisma.fishStock.upsert({
      where: {
        lakeId_fishTypeId: { lakeId, fishTypeId: data.fishTypeId },
      },
      update: {
        initialWeight: { increment: data.initialWeight },
        initialQuantity: { increment: data.initialQuantity },
        currentWeight: { increment: data.initialWeight },
        currentQuantity: { increment: data.initialQuantity },
        addedWeight: { increment: data.initialWeight },
        addedCount: { increment: data.initialQuantity },
        notes: data.notes,
      },
      create: {
        lakeId,
        fishTypeId: data.fishTypeId,
        initialWeight: data.initialWeight,
        initialQuantity: data.initialQuantity,
        currentWeight: data.initialWeight,
        currentQuantity: data.initialQuantity,
        notes: data.notes,
      },
    });

    if (session?.user?.id) {
      await recordActivityLog(session.user.id, "FISH_STOCK_ADD", {
        fishTypeId: data.fishTypeId,
        weight: data.initialWeight,
        quantity: data.initialQuantity,
      }, { lakeId, entityType: "FISH", entityId: stock.id });
    }

    revalidatePath("/dashboard/fish-stock");
    return { success: true, data: stock };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adjustFishStockAction(data: {
  fishTypeId: string;
  adjustment: "DEAD" | "ADD";
  weight: number;
  quantity: number;
  notes?: string;
}) {
  try {
    const session = await auth();
    const lakeId = await getActiveLakeId();

    const updateData = data.adjustment === "DEAD"
      ? {
          currentWeight: { decrement: data.weight },
          currentQuantity: { decrement: data.quantity },
          deadCount: { increment: data.quantity },
        }
      : {
          currentWeight: { increment: data.weight },
          currentQuantity: { increment: data.quantity },
          addedCount: { increment: data.quantity },
          addedWeight: { increment: data.weight },
        };

    const stock = await prisma.fishStock.update({
      where: {
        lakeId_fishTypeId: { lakeId, fishTypeId: data.fishTypeId },
      },
      data: updateData,
    });

    if (session?.user?.id) {
      await recordActivityLog(
        session.user.id,
        data.adjustment === "DEAD" ? "FISH_STOCK_DEAD" : "FISH_STOCK_ADD_MORE",
        {
          fishTypeId: data.fishTypeId,
          weight: data.weight,
          quantity: data.quantity,
          notes: data.notes,
        },
        { lakeId, entityType: "FISH", entityId: stock.id }
      );
    }

    revalidatePath("/dashboard/fish-stock");
    return { success: true, data: stock };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
