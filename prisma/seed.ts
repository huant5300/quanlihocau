import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@fishing.saas" },
    update: {},
    create: {
      email: "admin@fishing.saas",
      name: "Super Admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log({ superAdmin });
  
  // Seed initial lake
  const lake = await prisma.fishingLake.upsert({
    where: { id: "lake_01" },
    update: {},
    create: {
      id: "lake_01",
      name: "Hồ Câu Đại Nam",
      address: "Bình Dương, Việt Nam",
      description: "Hồ câu chuyên cá tra và cá chép khủng.",
    },
  });
  
  console.log({ lake });

  // Seed areas
  const areas = [
    { name: "Chòi 01", hourlyRate: 50000 },
    { name: "Chòi 02", hourlyRate: 50000 },
    { name: "Chòi 03", hourlyRate: 50000 },
    { name: "Khu VIP 01", hourlyRate: 150000 },
  ];

  for (const area of areas) {
    await prisma.fishingArea.create({
      data: {
        ...area,
        lakeId: lake.id,
      },
    });
  }

  // Seed Fish Types
  const fishTypes = [
    { name: "Cá Tra", buybackPrice: 35000 },
    { name: "Cá Chép", buybackPrice: 45000 },
    { name: "Cá Rô Phi", buybackPrice: 20000 },
    { name: "Cá Chim", buybackPrice: 30000 },
  ];

  for (const fish of fishTypes) {
    await prisma.fishType.upsert({
      where: { name: fish.name },
      update: { buybackPrice: fish.buybackPrice },
      create: fish,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
