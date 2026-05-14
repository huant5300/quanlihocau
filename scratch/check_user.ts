import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "huant5300@gmail.com" }
  });

  if (!user) {
    console.log("Creating user huant5300@gmail.com...");
    await prisma.user.create({
      data: {
        email: "huant5300@gmail.com",
        name: "Anh Huân",
        role: "SUPER_ADMIN",
        isActive: true,
      }
    });
  } else {
    console.log("User already exists:", user.email);
    // Ensure user has correct role
    if (user.role !== "SUPER_ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "SUPER_ADMIN" }
      });
      console.log("Updated user to SUPER_ADMIN");
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
