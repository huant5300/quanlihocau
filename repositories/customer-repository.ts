import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class CustomerRepository {
  static async getAll(lakeId: string) {
    return prisma.customer.findMany({
      where: { lakeId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { startTime: "desc" },
          take: 10
        },
        invoices: true
      }
    });
  }

  static async create(data: Prisma.CustomerUncheckedCreateInput) {
    return prisma.customer.create({ data });
  }

  static async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.customer.delete({
      where: { id }
    });
  }
}
