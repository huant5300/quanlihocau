import { PrismaClient, UserRole, AreaStatus, StockType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing data
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.fishCatch.deleteMany();
  await prisma.fishingSession.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.fishingArea.deleteMany();
  await prisma.fishingPackage.deleteMany();
  await prisma.fishType.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.fishingLake.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create default users
  const superAdminPassword = await hash("admin123", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@fishing.saas" },
    update: {},
    create: {
      email: "admin@fishing.saas",
      name: "Super Admin",
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const ownerPassword = await hash("owner123", 12);
  const owner = await prisma.user.upsert({
    where: { email: "owner@fishing.saas" },
    update: {},
    create: {
      email: "owner@fishing.saas",
      name: "Lake Owner",
      password: ownerPassword,
      role: UserRole.OWNER,
    },
  });

  // 3. Create a fishing lake
  const lake = await prisma.fishingLake.create({
    data: {
      id: "lake_01",
      name: "Hồ Câu Đại Nam",
      description: "Hồ câu chuyên cá tra và cá chép khủng.",
      address: "Bình Dương, Việt Nam",
    },
  });

  // 4. Create fishing packages (Requirement: 5h, 10h, Hourly)
  const packages = [
    { id: "pkg_5h", name: "Ca 5 Giờ", durationHours: 5, price: 250000, isActive: true },
    { id: "pkg_10h", name: "Ca 10 Giờ", durationHours: 10, price: 450000, isActive: true },
    { id: "pkg_hourly", name: "Giờ lẻ", durationHours: 1, price: 60000, isActive: true },
  ];

  for (const pkg of packages) {
    await prisma.fishingPackage.create({ data: pkg });
  }

  // 5. Create fishing areas (huts)
  const areas = Array.from({ length: 15 }).map((_, i) => ({
    name: `Chòi ${i + 1}`,
    lakeId: lake.id,
    status: AreaStatus.AVAILABLE,
    hourlyRate: 50000,
    capacity: 1,
    minDuration: 1
  }));

  for (const area of areas) {
    await prisma.fishingArea.create({ data: area });
  }

  // 6. Create product categories
  const categories = [
    { id: "cat_bait", name: "Mồi câu" },
    { id: "cat_drink", name: "Đồ uống" },
    { id: "cat_food", name: "Đồ ăn" },
    { id: "cat_equipment", name: "Dụng cụ" },
  ];

  for (const cat of categories) {
    await prisma.productCategory.create({ data: cat });
  }

  // 7. Create products
  const products = [
    { name: "Mồi Cám Xanh", categoryId: "cat_bait", price: 25000, stock: 100, lakeId: lake.id },
    { name: "Mồi Cám Đỏ", categoryId: "cat_bait", price: 30000, stock: 80, lakeId: lake.id },
    { name: "Nước Suối", categoryId: "cat_drink", price: 10000, stock: 200, lakeId: lake.id },
    { name: "Sting", categoryId: "cat_drink", price: 15000, stock: 150, lakeId: lake.id },
    { name: "Coca Cola", categoryId: "cat_drink", price: 15000, stock: 150, lakeId: lake.id },
    { name: "Mì Xào Bò", categoryId: "cat_food", price: 45000, stock: 50, lakeId: lake.id },
    { name: "Cơm Chiên Dương Châu", categoryId: "cat_food", price: 55000, stock: 30, lakeId: lake.id },
    { name: "Phao Câu", categoryId: "cat_equipment", price: 50000, stock: 20, lakeId: lake.id },
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  // 8. Create fish types
  const fishTypes = [
    { name: "Cá Tra", buybackPrice: 25000 },
    { name: "Cá Chép", buybackPrice: 35000 },
    { name: "Cá Trê", buybackPrice: 20000 },
    { name: "Cá Chim", buybackPrice: 30000 },
  ];

  for (const fish of fishTypes) {
    await prisma.fishType.create({ data: fish });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
