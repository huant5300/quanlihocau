import prisma from "@/lib/prisma";
import { Customer, Prisma } from "@prisma/client";

export class CustomerRepository {
  static async getAll() {
    return prisma.customer.findMany({
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

  static async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  }

  static async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data
    });
  }
}
