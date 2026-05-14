import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Database for Hồ Kim Thông...");

  // 1. Create or verify 3 ponds (FishingLake)
  const ponds = [
    { name: 'Hồ Kim Thông 1', totalSpots: 15 },
    { name: 'Hồ Kim Thông 2', totalSpots: 15 },
    { name: 'Hồ Kim Thông 3', totalSpots: 15 },
  ];

  for (const pond of ponds) {
    const existing = await prisma.fishingLake.findFirst({
      where: { name: pond.name }
    });

    if (!existing) {
      await prisma.fishingLake.create({
        data: pond
      });
      console.log(`Created: ${pond.name}`);
    } else {
      console.log(`Exists: ${pond.name}`);
    }
  }

  // 2. Create or verify 2 price rates (FishingPackage)
  const packages = [
    { id: 'suat-5h', name: 'Suất 5 giờ - 300.000đ', durationHours: 5, price: 300000, isActive: true },
    { id: 'suat-10h', name: 'Suất 10 giờ - 500.000đ', durationHours: 10, price: 500000, isActive: true },
  ];

  for (const pkg of packages) {
    const existing = await prisma.fishingPackage.findUnique({
      where: { id: pkg.id }
    });

    if (!existing) {
      await prisma.fishingPackage.create({
        data: pkg
      });
      console.log(`Created: ${pkg.name}`);
    } else {
      console.log(`Exists: ${pkg.name}`);
    }
  }

  // 3. Ensure spots (FishingArea) for the ponds
  const lakes = await prisma.fishingLake.findMany();
  for (const lake of lakes) {
    const spotsCount = await prisma.fishingArea.count({ where: { lakeId: lake.id } });
    if (spotsCount === 0) {
      console.log(`Creating spots for ${lake.name}...`);
      for (let i = 1; i <= 10; i++) {
        await prisma.fishingArea.create({
          data: {
            name: `Chòi ${i}`,
            lakeId: lake.id,
            status: "AVAILABLE",
            hourlyRate: 60000, // Default 60k/h
          }
        });
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
