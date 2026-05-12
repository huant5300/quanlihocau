import prisma from "@/lib/prisma";
import { FishingSession, Prisma } from "@prisma/client";

export class SessionRepository {
  static async getAllActive() {
    return prisma.fishingSession.findMany({
      where: { status: "ACTIVE" },
      include: {
        area: true,
        customer: true,
        fishCatches: {
          include: { fishType: true }
        }
      },
      orderBy: { startTime: "desc" }
    });
  }

  static async findById(id: string) {
    return prisma.fishingSession.findUnique({
      where: { id },
      include: {
        area: true,
        customer: true,
        fishCatches: {
          include: { fishType: true }
        }
      }
    });
  }

  static async create(data: Prisma.FishingSessionCreateInput) {
    return prisma.fishingSession.create({ data });
  }

  static async update(id: string, data: Prisma.FishingSessionUpdateInput) {
    return prisma.fishingSession.update({
      where: { id },
      data
    });
  }
}
