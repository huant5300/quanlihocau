import "dotenv/config";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      role: true,
      lakeId: true,
      isActive: true,
      password: true,
    }
  });
  console.log("=== USERS IN DATABASE ===");
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      phone: u.phone,
      name: u.name,
      role: u.role,
      lakeId: u.lakeId,
      isActive: u.isActive,
      hasPassword: !!u.password,
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

