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
    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId }
    });

    if (!lake) {
      return NextResponse.json({ success: false, message: "Lake not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: lake.name,
      address: lake.address || "",
      totalSpots: lake.totalSpots,
      receipt_footer: lake.description || ""
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    const body = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const updatedLake = await tx.fishingLake.update({
        where: { id: lakeId },
        data: {
          name: body.name,
          address: body.address,
          description: body.receipt_footer,
          totalSpots: body.totalSpots ? Number(body.totalSpots) : undefined
        }
      });

      // Sync FishingArea records if totalSpots is provided
      if (body.totalSpots) {
        const total = Number(body.totalSpots);
        const existingAreas = await tx.fishingArea.findMany({
          where: { lakeId },
          orderBy: { name: "asc" }
        });

        // Add missing areas
        if (existingAreas.length < total) {
          const toAdd = total - existingAreas.length;
          const lastNum = existingAreas.length > 0 
            ? parseInt(existingAreas[existingAreas.length - 1].name.replace("Ô số ", "")) || existingAreas.length
            : 0;

          for (let i = 1; i <= toAdd; i++) {
            await tx.fishingArea.create({
              data: {
                lakeId,
                name: `Ô số ${existingAreas.length + i}`,
                hourlyRate: 50000, // Default rate
              }
            });
          }
        }
        // Optional: Remove extra areas? User didn't specify, but usually we shouldn't delete if they have history.
      }

      return updatedLake;
    });

    return NextResponse.json({
      name: result.name,
      address: result.address || "",
      totalSpots: result.totalSpots,
      receipt_footer: result.description || ""
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
