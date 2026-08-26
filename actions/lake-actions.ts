"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { setActiveLakeId, getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { recordActivityLog } from "@/lib/activity-log";
import { UserRole, AreaStatus } from "@prisma/client";

export async function switchLake(lakeId: string) {
  await setActiveLakeId(lakeId);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMyLakes() {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Find user in database by ID or email or phone
    let dbUser = session.user.id
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : null;

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    }
    if (!dbUser && (session.user as any).phone) {
      dbUser = await prisma.user.findFirst({ where: { phone: (session.user as any).phone } });
    }

    const effectiveUserId = dbUser?.id || session.user.id;
    const effectiveRole = dbUser?.role || session.user.role;

    // If Super Admin, return all lakes
    if (effectiveRole === UserRole.SUPER_ADMIN) {
      const lakes = await prisma.fishingLake.findMany({
        orderBy: { name: "asc" },
      });
      return { success: true, data: lakes };
    }

    // If Staff or Cashier, only return the single lake they are assigned to
    if (effectiveRole === UserRole.STAFF || effectiveRole === UserRole.CASHIER) {
      const lakeId = dbUser?.lakeId || session.user.lakeId;
      if (!lakeId) return { success: true, data: [] };

      const lakes = await prisma.fishingLake.findMany({
        where: { id: lakeId },
        orderBy: { name: "asc" },
      });
      return { success: true, data: lakes };
    }

    // Otherwise (OWNER) return lakes managed by the user
    let lakes = await prisma.fishingLake.findMany({
      where: { managerId: effectiveUserId },
      orderBy: { name: "asc" },
    });

    // If owner has no lake, auto create 1 onboarding lake with 5-day trial
    if (lakes.length === 0 && effectiveUserId) {
      const displayName = dbUser?.name || session.user.name || "Chủ Hồ";
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 5);

      const newLake = await prisma.fishingLake.create({
        data: {
          name: `Hồ Câu ${displayName}`,
          description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
          address: "Chưa cập nhật",
          phone: dbUser?.phone || (session.user as any).phone || "Chưa cập nhật",
          managerId: effectiveUserId,
          totalSpots: 10,
          subscriptionPlan: "TRIAL",
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: trialExpiry,
        },
      });

      if (dbUser) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { lakeId: newLake.id },
        });
      }

      await prisma.fishingArea.createMany({
        data: [1, 2, 3, 4, 5].map((n) => ({
          name: `Chòi ${n}`,
          lakeId: newLake.id,
          status: AreaStatus.AVAILABLE,
          hourlyRate: 50000,
          capacity: 1,
          minDuration: 1,
        })),
      });

      lakes = [newLake];
    }

    return { success: true, data: lakes };
  } catch (error) {
    console.error("Error fetching lakes:", error);
    return { success: false, error: "Failed to fetch lakes" };
  }
}

export async function getLakeDetails(lakeId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
      include: {
        areas: true,
      },
    });
    return { success: true, data: lake };
  } catch (error) {
    return { success: false, error: "Failed to fetch lake details" };
  }
}

export async function getLakeOwners() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN || session.user.email === "huant5300@gmail.com";
  if (!isSuperAdmin) {
    return { success: false, error: "Bạn không có quyền truy cập trang quản trị này" };
  }

  try {
    const owners = await prisma.user.findMany({
      where: {
        OR: [
          { role: UserRole.OWNER },
          { role: UserRole.SUPER_ADMIN },
          { managedLake: { some: {} } }
        ]
      },
      include: {
        managedLake: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const ownersData = await Promise.all(
      owners.map(async (owner) => {
        const lakesData = await Promise.all(
          owner.managedLake.map(async (lake) => {
            const [
              activeSessionsCount,
              totalSessionsCount,
              revenueAgg,
              recentSessions,
              recentTransactions,
              recentActivityLogs
            ] = await Promise.all([
              prisma.fishingSession.count({
                where: {
                  lakeId: lake.id,
                  status: "ACTIVE"
                }
              }),
              prisma.fishingSession.count({
                where: {
                  lakeId: lake.id
                }
              }),
              prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                  lakeId: lake.id,
                  type: "INCOME"
                }
              }),
              prisma.fishingSession.findMany({
                where: {
                  lakeId: lake.id
                },
                take: 5,
                orderBy: {
                  createdAt: "desc"
                },
                include: {
                  customer: true,
                  area: true
                }
              }),
              prisma.transaction.findMany({
                where: {
                  lakeId: lake.id
                },
                take: 5,
                orderBy: {
                  createdAt: "desc"
                }
              }),
              prisma.activityLog.findMany({
                where: {
                  OR: [
                    { lakeId: lake.id },
                    { userId: owner.id }
                  ]
                },
                take: 10,
                orderBy: {
                  createdAt: "desc"
                },
                include: {
                  user: {
                    select: { name: true, email: true }
                  }
                }
              })
            ]);

            return {
              id: lake.id,
              name: lake.name,
              address: lake.address,
              phone: lake.phone,
              totalSpots: lake.totalSpots,
              subscriptionPlan: lake.subscriptionPlan || "TRIAL",
              subscriptionStatus: lake.subscriptionStatus || "ACTIVE",
              subscriptionExpiresAt: lake.subscriptionExpiresAt ? lake.subscriptionExpiresAt.toISOString() : null,
              activeSessionsCount,
              totalSessionsCount,
              totalRevenue: Number(revenueAgg._sum.amount || 0),
              recentSessions: recentSessions.map(s => ({
                id: s.id,
                customerName: s.customer?.fullName || "Khách vãng lai",
                areaName: s.area?.name || "Khu vực câu",
                startTime: s.startTime.toISOString(),
                endTime: s.endTime ? s.endTime.toISOString() : null,
                status: s.status,
                amount: Number(s.sessionAmount)
              })),
              recentTransactions: recentTransactions.map(t => ({
                id: t.id,
                amount: Number(t.amount),
                type: t.type,
                category: t.category,
                description: t.description || "Giao dịch hệ thống",
                createdAt: t.createdAt.toISOString()
              })),
              recentActivityLogs: recentActivityLogs.map(log => ({
                id: log.id,
                action: log.action,
                details: log.details,
                createdAt: log.createdAt.toISOString(),
                userName: log.user?.name || "Hệ thống",
                userEmail: log.user?.email || ""
              }))
            };
          })
        );

        return {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          appUsageTime: owner.appUsageTime || 0,
          isActive: owner.isActive,
          createdAt: owner.createdAt.toISOString(),
          lakes: lakesData
        };
      })
    );

    return { success: true, data: ownersData };
  } catch (error: any) {
    console.error("Error in getLakeOwners server action:", error);
    return { success: false, error: error.message || "Failed to fetch owners" };
  }
}

export async function updateLakeDetails(data: { name: string; address: string; phone: string }) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  
  const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN || session.user.email === "huant5300@gmail.com";
  if (session.user.role !== UserRole.OWNER && !isSuperAdmin) {
    return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
  }

  const phoneTrimmed = data.phone?.trim();
  if (!phoneTrimmed) {
    return { success: false, error: "Số điện thoại liên hệ là bắt buộc." };
  }
  const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
  if (!vnPhoneRegex.test(phoneTrimmed)) {
    return { success: false, error: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (ví dụ: 0912345678)." };
  }

  try {
    // 1. Find user in database safely
    let dbUser = session.user.id
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : null;

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    }
    if (!dbUser && (session.user as any).phone) {
      dbUser = await prisma.user.findFirst({ where: { phone: (session.user as any).phone } });
    }

    const effectiveUserId = dbUser?.id || session.user.id;
    let lakeId = await getActiveLakeId();

    // 2. Check if lake exists
    let lake = lakeId ? await prisma.fishingLake.findUnique({ where: { id: lakeId } }) : null;

    if (!lake && effectiveUserId) {
      lake = await prisma.fishingLake.findFirst({
        where: { managerId: effectiveUserId }
      });
    }

    // Check unique phone number across other lakes
    const existingLakeWithPhone = await prisma.fishingLake.findFirst({
      where: {
        phone: phoneTrimmed,
        ...(lake?.id ? { id: { not: lake.id } } : {})
      }
    });

    if (existingLakeWithPhone) {
      return {
        success: false,
        error: `Số điện thoại ${phoneTrimmed} đã được đăng ký bởi hồ câu khác! Mỗi tài khoản / hồ câu chỉ được sử dụng 1 số điện thoại duy nhất.`
      };
    }

    if (lake) {
      // Update existing lake
      lake = await prisma.fishingLake.update({
        where: { id: lake.id },
        data: {
          name: data.name,
          address: data.address,
          phone: phoneTrimmed,
        }
      });
    } else if (effectiveUserId) {
      // Create new lake if not found
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 5);

      const createdLake = await prisma.fishingLake.create({
        data: {
          name: data.name,
          description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
          address: data.address,
          phone: phoneTrimmed,
          managerId: effectiveUserId,
          totalSpots: 10,
          subscriptionPlan: "TRIAL",
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: trialExpiry,
        }
      });

      await prisma.fishingArea.createMany({
        data: [1, 2, 3, 4, 5].map((n) => ({
          name: `Chòi ${n}`,
          lakeId: createdLake.id,
          status: AreaStatus.AVAILABLE,
          hourlyRate: 50000,
          capacity: 1,
          minDuration: 1,
        })),
      });

      lake = createdLake;
    }

    if (!lake) {
      return { success: false, error: "Không tìm thấy thông tin hồ câu để cập nhật" };
    }

    // 3. Safely update user phone and lakeId if user exists in DB
    if (dbUser) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          phone: phoneTrimmed,
          lakeId: lake.id
        }
      });
    }

    // 4. Set active lake cookie
    await setActiveLakeId(lake.id);

    // 5. Record activity log safely
    if (dbUser) {
      try {
        await recordActivityLog(dbUser.id, "UPDATE_LAKE", {
          name: data.name,
          phone: phoneTrimmed,
          context: "onboarding"
        });
      } catch (logErr) {
        console.warn("Could not record activity log:", logErr);
      }
    }

    return { success: true, data: lake };
  } catch (error: any) {
    console.error("Error updating lake details:", error);
    return { success: false, error: error.message || "Failed to update lake details" };
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  
  const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN || session.user.email === "huant5300@gmail.com";
  if (!isSuperAdmin) {
    return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, name: true, email: true, phone: true, isActive: true }
    });

    return { success: true, data: updatedUser };
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    return { success: false, error: error.message || "Failed to update user status" };
  }
}
