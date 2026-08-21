import "dotenv/config";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, AreaStatus } from "@prisma/client";

async function main() {
  const phone = "0855550813";
  const rawPassword = "123456";
  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + 5);

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email: "0855550813@quanlihocau.com" }]
    }
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        phone: phone,
        isActive: true,
      }
    });
    console.log("Updated password for existing user:", user.id);
  } else {
    user = await prisma.user.create({
      data: {
        name: "Chủ Hồ (0855550813)",
        phone: phone,
        password: hashedPassword,
        role: UserRole.OWNER,
        isActive: true,
      }
    });

    const lake = await prisma.fishingLake.create({
      data: {
        name: "Hồ Câu Dịch Vụ Mẫu",
        description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
        address: "Việt Nam",
        phone: phone,
        managerId: user.id,
        totalSpots: 10,
        subscriptionPlan: "TRIAL",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: trialExpiry,
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lakeId: lake.id }
    });

    await prisma.fishingArea.createMany({
      data: [1, 2, 3, 4, 5].map((n) => ({
        name: `Chòi ${n}`,
        lakeId: lake.id,
        status: AreaStatus.AVAILABLE,
        hourlyRate: 50000,
        capacity: 1,
        minDuration: 1,
      })),
    });

    console.log("Created new user and lake for 0855550813:", user.id);
  }

  console.log("SUCCESS! User 0855550813 can now login with password: " + rawPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
