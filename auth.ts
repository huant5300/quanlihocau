

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

    // 1. Create a default lake with a 5-day TRIAL plan
    const lakeName = `Hồ câu ${userName}`;
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 5); // 5 days trial

    const lake = await prisma.fishingLake.create({
      data: {
        name: lakeName,
        description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
        address: "Chưa cập nhật",
        phone: "Chưa cập nhật",
        managerId: userId,
        totalSpots: 10,
        subscriptionPlan: "TRIAL",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: trialExpiry,
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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "quanlihocau_secret_key_2026_safe",
  basePath: "/api/auth",
  session: { strategy: "jwt" },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    // Google OAuth - chỉ bật khi có đầy đủ credentials
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const loginId = credentials?.email as string;
        if (!loginId || !credentials?.password) {
          console.warn("[Auth:Authorize] Fail: Missing login identifier or password");
          return null;
        }

        try {
          console.log(`[Auth:Authorize] Attempting login for identifier: ${loginId}`);
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: loginId },
                { username: loginId },
                { phone: loginId }
              ]
            },
          });

          if (!user) {
            console.warn(`[Auth:Authorize] Fail: User not found for '${loginId}'`);
            return null;
          }

          if (!user.password) {
            console.warn(`[Auth:Authorize] Fail: User '${loginId}' has no password configured (OAuth account)`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.warn(`[Auth:Authorize] Fail: Invalid password for '${loginId}'`);
            return null;
          }

          // Check if user account is locked/inactive
          if (user.isActive === false) {
            console.warn(`[Auth:Authorize] Fail: Account is locked / inactive (isActive: false) for '${loginId}'`);
            return null;
          } else if (user.isActive === undefined || user.isActive === null) {
            console.warn(`[Auth:Authorize] Warning: user.isActive is undefined/null, defaulting safely to active for '${loginId}'`);
          }

          // Ensure lake onboarding for OWNER, safely caught so login never fails
          if (user.role === UserRole.OWNER && !user.lakeId) {
            try {
              const hasLake = await prisma.fishingLake.findFirst({
                where: { managerId: user.id },
              });
              if (hasLake) {
                user.lakeId = hasLake.id;
                await prisma.user.update({
                  where: { id: user.id },
                  data: { lakeId: hasLake.id },
                });
              } else {
                const lakeId = await setupOnboardingData(user.id, user.name || "Chủ Hồ");
                if (lakeId) user.lakeId = lakeId;
              }
            } catch (onboardingErr) {
              console.error("[Auth:Authorize] Warning: Lake onboarding failed during login, continuing:", onboardingErr);
            }
          }

          console.log(`[Auth:Authorize] Success: Authenticated user ${user.id} (${user.role})`);
          return {
            id: user.id,
            name: user.name,
            email: user.email || (user.phone ? `${user.phone.replace(/[^0-9]/g, "")}@phone.local` : `${user.id}@user.local`),
            role: user.role,
            lakeId: user.lakeId || null,
            phone: user.phone || null,
          } as any;
        } catch (error) {
          console.error(`[Auth:Authorize] DB Error for '${loginId}':`, error instanceof Error ? error.message : error);
          return null;
        }
      },
    }),
    Credentials({
      id: "firebase-phone",
      name: "Firebase Phone",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken as string;
        if (!idToken) return null;

        let decodedToken;
        try {
          const { adminAuth } = await import("@/lib/firebase-admin");
          decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (error) {
          console.error("Firebase Token Verification Error:", error);
          throw new Error("Xác thực Firebase thất bại hoặc token hết hạn");
        }

        const phone = decodedToken.phone_number;
        if (!phone) {
          throw new Error("Không lấy được số điện thoại từ Firebase");
        }

        // Find or create user by phone
        let user = await prisma.user.findFirst({
          where: { phone }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: phone,
              name: `Chủ Hồ (${phone.slice(-4)})`,
              role: UserRole.OWNER,
            }
          });
          const lakeId = await setupOnboardingData(user.id, user.name || "Chủ Hồ");
          user.lakeId = lakeId;
        } else if (user.role === UserRole.OWNER && !user.lakeId) {
          const hasLake = await prisma.fishingLake.findFirst({
            where: { managerId: user.id },
          });
          if (!hasLake) {
            const lakeId = await setupOnboardingData(user.id, user.name || "Chủ Hồ");
            user.lakeId = lakeId;
          }
        }

        if (!user.isActive) {
          throw new Error("Tài khoản đã bị khóa");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email || `${phone.replace(/\+/g, '')}@phone.local`,
          role: user.role,
          lakeId: user.lakeId,
        };
      }
    }),
    ...(process.env.ZALO_CLIENT_ID && process.env.ZALO_CLIENT_SECRET ? [
      {
        id: "zalo",
        name: "Zalo",
        type: "oauth" as const,
        authorization: {
          url: "https://oauth.zaloapp.com/v4/permission",
          params: {
            app_id: process.env.ZALO_CLIENT_ID,
            scope: "gems",
          }
        },
        client: {
          token_endpoint_auth_method: "none" as const,
        },
        token: {
          url: "https://oauth.zaloapp.com/v4/access_token",
          async request(context: any) {
            const body = new URLSearchParams({
              code: (context.params.code as string) || "",
              app_id: process.env.ZALO_CLIENT_ID || "",
              grant_type: "authorization_code",
            });
            if (context.checks.code_verifier) {
              body.append("code_verifier", context.checks.code_verifier);
            }
            
            const response = await fetch("https://oauth.zaloapp.com/v4/access_token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "secret_key": process.env.ZALO_CLIENT_SECRET || "",
              },
              body,
            });
            
            const tokens = await response.json();
            if (!response.ok) {
              throw new Error(`Zalo Token Error: ${JSON.stringify(tokens)}`);
            }
            return { tokens };
          }
        },
        userinfo: {
          url: "https://graph.zalo.me/v2.0/me",
          async request(context: any) {
            const response = await fetch("https://graph.zalo.me/v2.0/me?fields=id,name,picture", {
              headers: {
                access_token: (context.tokens.access_token as string) || "",
              },
            });
            return await response.json();
          }
        },
        profile(profile: any) {
          return {
            id: profile.id,
            name: profile.name,
            email: `${profile.id}@zalo.me`,
            image: profile.picture?.data?.url || null,
            role: UserRole.OWNER,
          };
        }
      }
    ] : [])
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials and Firebase phone logins are already validated in authorize()
      if (account?.provider === "credentials" || account?.provider === "firebase-phone") {
        if (user?.id) {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              details: { provider: account.provider },
            },
          }).catch((err) => console.error("Error creating activity log:", err));
        }
        return true;
      }

      const email = user?.email;
      if (!email) return false;

      let currentUserId = user.id;

      if (account?.provider === "google" || account?.provider === "zalo") {
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
          currentUserId = newUser.id;
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
          currentUserId = existingUser.id;
        }
      }

      if (currentUserId) {
        await prisma.activityLog.create({
          data: {
            userId: currentUserId,
            action: "LOGIN",
            details: { provider: account?.provider || "oauth" },
          },
        }).catch((err) => console.error("Error creating activity log:", err));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.lakeId = (user as any).lakeId || null;
        token.phone = (user as any).phone || null;
        token.appUsageTime = (user as any).appUsageTime || 0;
      } else if (token.role === undefined) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(token.id ? [{ id: token.id as string }] : []),
              ...(token.sub ? [{ id: token.sub as string }] : []),
              ...(token.email ? [{ email: token.email }, { username: token.email }] : []),
            ]
          },
          select: { role: true, id: true, lakeId: true, phone: true, appUsageTime: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
          token.lakeId = dbUser.lakeId || null;
          token.phone = dbUser.phone || null;
          token.appUsageTime = dbUser.appUsageTime || 0;
        }
      }
      if (token.email === "huant5300@gmail.com") {
        token.role = UserRole.SUPER_ADMIN;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = (token.role as UserRole) || UserRole.STAFF;
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.lakeId = (token.lakeId as string) || "";
        (session.user as any).phone = (token.phone as string) || "";
        (session.user as any).appUsageTime = (token.appUsageTime as number) || 0;
      }
      if (session.user?.email === "huant5300@gmail.com") {
        session.user.role = UserRole.SUPER_ADMIN;
      }
      return session;
    },
  },
});
