import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load production environment variables
dotenv.config({ path: ".env.production.local" });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query", "info", "warn", "error"] });

async function testRegistration() {
  const email = "test_registration_" + Date.now() + "@example.com";
  const phone = "0999" + Math.floor(100000 + Math.random() * 900000);
  
  try {
    console.log("Connecting to database:", connectionString?.substring(0, 30) + "...");
    
    // Check if we can connect
    await prisma.$connect();
    console.log("Connected successfully!");

    const displayName = "Test Owner";
    
    // 1. Create user
    console.log("Creating user...");
    const user = await prisma.user.create({
      data: {
        name: displayName,
        email: email,
        phone: phone,
        password: "hashedpassword123",
        role: "OWNER",
        isActive: true,
      },
    });
    console.log("User created with ID:", user.id);

    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 5);

    // 2. Create default lake
    console.log("Creating lake...");
    const lake = await prisma.fishingLake.create({
      data: {
        name: `Hồ Câu ${displayName}`,
        description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
        address: "Chưa cập nhật",
        phone: phone || email || "Chưa cập nhật",
        managerId: user.id,
        totalSpots: 10,
        subscriptionPlan: "TRIAL",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: trialExpiry,
      },
    });
    console.log("Lake created with ID:", lake.id);

    // 3. Link user -> lake
    console.log("Updating user with lakeId...");
    await prisma.user.update({
      where: { id: user.id },
      data: { lakeId: lake.id },
    });

    // 4. Create 5 default fishing areas
    console.log("Creating fishing areas...");
    await prisma.fishingArea.createMany({
      data: [1, 2, 3, 4, 5].map((n) => ({
        name: `Chòi ${n}`,
        lakeId: lake.id,
        status: "AVAILABLE",
        hourlyRate: 50000,
        capacity: 1,
        minDuration: 1,
      })),
    });

    // 5. Log the registration activity
    console.log("Creating activity log...");
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        details: {
          method: "phone",
          trialDays: 5,
        },
      },
    });

    console.log("Registration simulated successfully!");
    
    // Clean up
    console.log("Cleaning up test data...");
    await prisma.fishingLake.delete({ where: { id: lake.id } });
    await prisma.user.delete({ where: { id: user.id } });
    
  } catch (error) {
    console.error("ERROR during registration:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testRegistration();
