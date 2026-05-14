import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let category = await prisma.productCategory.findFirst({
    where: { name: "Đồ uống & Thức ăn" }
  });

  if (!category) {
    category = await prisma.productCategory.create({
      data: { name: "Đồ uống & Thức ăn" }
    });
  }

  console.log("CATEGORY_ID=" + category.id);
}

main().finally(() => prisma.$disconnect());
