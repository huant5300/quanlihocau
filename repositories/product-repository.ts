import prisma from "@/lib/prisma";
import { Product, Prisma, StockType } from "@prisma/client";

export class ProductRepository {
  static async getAll(lakeId?: string) {
    return prisma.product.findMany({
      where: lakeId ? {
        OR: [{ lakeId }, { lakeId: null }]
      } : undefined,
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

  static async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the product
      const product = await tx.product.create({
        data,
        include: { category: true }
      });

      // 2. If initial stock is provided, create an inventory transaction
      if (data.stock && data.stock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: StockType.IN,
            quantity: data.stock,
            note: "Khởi tạo tồn kho ban đầu"
          }
        });
      }

      return product;
    });
  }

  static async update(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  static async delete(id: string) {
    return prisma.product.delete({
      where: { id }
    });
  }

  static async addStock(productId: string, quantity: number, note?: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } }
      });

      await tx.inventoryTransaction.create({
        data: {
          productId,
          type: StockType.IN,
          quantity,
          note: note || "Nhập kho bổ sung"
        }
      });

      return product;
    });
  }
}
