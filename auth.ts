import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

import { authConfig } from "./auth.config";

// Onboarding helper to create a default high-quality lake for a new Owner
async function setupOnboardingData(userId: string, userName: string) {
  try {
    console.log(`Setting up onboarding data for user: ${userId} (${userName})`);
    
    // 1. Create a default lake
    const lakeName = `Hồ câu ${userName}`;
    const lake = await prisma.fishingLake.create({
      data: {
        name: lakeName,
        description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
        address: "Chưa cập nhật",
        phone: "Chưa cập nhật",
        managerId: userId,
        totalSpots: 10,
      },
    });
    
    // 2. Associate the manager user with this lake directly
    await prisma.user.update({
      where: { id: userId },
      data: { lakeId: lake.id },
    });

    // 3. Create default fishing areas (5 huts)
    const areasData = [
      { name: "Chòi 1", lakeId: lake.id, status: "AVAILABLE" as any, hourlyRate: 50000, capacity: 1, minDuration: 1 },
      { name: "Chòi 2", lakeId: lake.id, status: "AVAILABLE" as any, hourlyRate: 50000, capacity: 1, minDuration: 1 },
      { name: "Chòi 3", lakeId: lake.id, status: "AVAILABLE" as any, hourlyRate: 50000, capacity: 1, minDuration: 1 },
      { name: "Chòi 4", lakeId: lake.id, status: "AVAILABLE" as any, hourlyRate: 50000, capacity: 1, minDuration: 1 },
      { name: "Chòi 5", lakeId: lake.id, status: "AVAILABLE" as any, hourlyRate: 50000, capacity: 1, minDuration: 1 },
    ];
    await prisma.fishingArea.createMany({ data: areasData });

    // 4. Create default categories if they don't exist
    const categories = [
      { id: "cat_bait", name: "Mồi câu" },
      { id: "cat_drink", name: "Đồ uống" },
      { id: "cat_food", name: "Đồ ăn" },
      { id: "cat_equipment", name: "Dụng cụ" },
    ];
    for (const cat of categories) {
      await prisma.productCategory.upsert({
        where: { id: cat.id },
        update: {},
        create: cat,
      });
    }

    // 5. Create default products for this new lake
    const productsData = [
      { name: "Nước Suối", categoryId: "cat_drink", price: 10000, stock: 100, unit: "Chai", lakeId: lake.id },
      { name: "Sting dâu", categoryId: "cat_drink", price: 15000, stock: 100, unit: "Lon", lakeId: lake.id },
      { name: "Mồi Cám Xanh", categoryId: "cat_bait", price: 25000, stock: 50, unit: "Gói", lakeId: lake.id },
      { name: "Phao Câu", categoryId: "cat_equipment", price: 30000, stock: 20, unit: "Cái", lakeId: lake.id },
    ];
    await prisma.product.createMany({ data: productsData });

    // 6. Create default fish types if they don't exist
    const fishTypes = [
      { name: "Cá Tra", buybackPrice: 25000 },
      { name: "Cá Chép", buybackPrice: 35000 },
      { name: "Cá Trê", buybackPrice: 20000 },
      { name: "Cá Rô Phi", buybackPrice: 15000 },
    ];
    for (const fish of fishTypes) {
      await prisma.fishType.upsert({
        where: { name: fish.name },
        update: {},
        create: fish,
      });
    }

    console.log(`Successfully completed onboarding for ${userId}`);
    return lake.id;
  } catch (error) {
    console.error("Error in setupOnboardingData:", error);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ["none"],
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize attempt for:", credentials?.email);
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log("User found:", user ? "YES" : "NO");
          if (!user || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log("Password valid:", isPasswordValid);
          if (!isPasswordValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            lakeId: user.lakeId,
          };
        } catch (error) {
          console.error("Authorize Error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: email,
              name: user.name || "Chủ Hồ",
              image: user.image,
              role: UserRole.OWNER,
            },
          });
          const lakeId = await setupOnboardingData(newUser.id, newUser.name || "Chủ Hồ");
          user.role = UserRole.OWNER;
          user.id = newUser.id;
          (user as any).lakeId = lakeId;
        } else {
          if (existingUser.role === UserRole.OWNER) {
            const hasLake = await prisma.fishingLake.findFirst({
              where: { managerId: existingUser.id },
            });
            if (!hasLake) {
              const lakeId = await setupOnboardingData(existingUser.id, existingUser.name || "Chủ Hồ");
              existingUser.lakeId = lakeId;
            }
          }
          user.role = existingUser.role;
          user.id = existingUser.id;
          (user as any).lakeId = existingUser.lakeId;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.lakeId = (user as any).lakeId;
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true, id: true, lakeId: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
          token.lakeId = dbUser.lakeId;
        }
      }
      if (token.email === "huant5300@gmail.com") {
        token.role = UserRole.SUPER_ADMIN;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        session.user.lakeId = token.lakeId as string;
      }
      if (session.user?.email === "huant5300@gmail.com") {
        session.user.role = UserRole.SUPER_ADMIN;
      }
      return session;
    },
  },
});
