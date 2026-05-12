import prisma from "@/lib/prisma";
import { Product, Prisma } from "@prisma/client";

export class ProductRepository {
  static async getAll() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { name: "asc" }
    });
  }

  static async getCategories() {
    return prisma.productCategory.findMany({
      orderBy: { name: "asc" }
    });
  }

  static async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  }
}
