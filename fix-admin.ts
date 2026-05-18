import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";

async function main() {
  const email = "huant5300@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    console.log(`Updating role for ${email} to SUPER_ADMIN...`);
    const hashedPassword = await bcrypt.hash("123456", 10);
    await prisma.user.update({
      where: { email },
      data: { 
        role: "SUPER_ADMIN",
        password: hashedPassword
      }
    });
    console.log("Update successful!");
  } else {
    console.log(`User ${email} not found. Creating...`);
    const hashedPassword = await bcrypt.hash("123456", 10);
    await prisma.user.create({
      data: {
        email,
        name: "Huan Super Admin",
        role: "SUPER_ADMIN",
        password: hashedPassword,
        isActive: true
      }
    });
    console.log("Create successful!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
