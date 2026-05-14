import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking data...");

  // 1. Check for FishingLake
  let lake = await prisma.fishingLake.findFirst({
    where: { name: "Hồ Kim Thông" }
  });

  if (!lake) {
    console.log("Creating default lake 'Hồ Kim Thông'...");
    lake = await prisma.fishingLake.create({
      data: {
        name: "Hồ Kim Thông",
        totalSpots: 10,
        address: "Hà Nội",
      }
    });
  }

  // 2. Check for FishingAreas (Ponds)
  const pondNames = ['Hồ Kim Thông 1', 'Hồ Kim Thông 2', 'Hồ Kim Thông 3'];
  for (const name of pondNames) {
    const existingArea = await prisma.fishingArea.findFirst({
      where: { name, lakeId: lake.id }
    });

    if (!existingArea) {
      console.log(`Creating area: ${name}...`);
      await prisma.fishingArea.create({
        data: {
          name,
          lakeId: lake.id,
          status: "AVAILABLE",
          hourlyRate: 60000, // Default hourly rate if not specified
          capacity: 1,
        }
      });
    }
  }

  // 3. Check for FishingPackages (Price Rates)
  const packages = [
    { name: 'Ca 5 giờ - 300k', durationHours: 5, price: 300000 },
    { name: 'Ca 10 giờ - 500k', durationHours: 10, price: 500000 }
  ];

  for (const pkg of packages) {
    const id = pkg.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    const existingPkg = await prisma.fishingPackage.findFirst({
      where: { name: pkg.name }
    });

    if (!existingPkg) {
      console.log(`Creating package: ${pkg.name}...`);
      await prisma.fishingPackage.create({
        data: {
          id: id,
          name: pkg.name,
          durationHours: pkg.durationHours,
          price: pkg.price,
          isActive: true
        }
      });
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
