"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { setActiveLakeId, getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { recordActivityLog } from "@/lib/activity-log";

import { UserRole } from "@prisma/client";

export async function switchLake(lakeId: string) {
  await setActiveLakeId(lakeId);
  revalidatePath("/dashboard");
  return { success: true };
}
export async function getMyLakes() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // If Super Admin, return all lakes
    if (session.user.role === UserRole.SUPER_ADMIN) {
      const lakes = await prisma.fishingLake.findMany({
        orderBy: { name: "asc" },
      });
      return { success: true, data: lakes };
    }

    // If Staff or Cashier, only return the single lake they are assigned to
    if (session.user.role === UserRole.STAFF || session.user.role === UserRole.CASHIER) {
      const userWithLake = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { lakeId: true }
      });
      
      if (!userWithLake?.lakeId) {
        return { success: true, data: [] };
      }

      const lakes = await prisma.fishingLake.findMany({
        where: {
          id: userWithLake.lakeId
        },
        orderBy: { name: "asc" },
      });
      return { success: true, data: lakes };
    }

    // Otherwise (OWNER) return lakes managed by the user
    const lakes = await prisma.fishingLake.findMany({
      where: {
        managerId: session.user.id,
      },
      orderBy: { name: "asc" },
    });
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
  if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const owners = await prisma.user.findMany({
      where: {
        role: UserRole.OWNER
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
              subscriptionPlan: lake.subscriptionPlan || "FREE",
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
  if (!session) return { success: false, error: "Unauthorized" };
  
  const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN || session.user.email === "huant5300@gmail.com";
  if (session.user.role !== UserRole.OWNER && !isSuperAdmin) {
    return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
  }

  const lakeId = await getActiveLakeId();
  
  const phoneTrimmed = data.phone?.trim();
  if (!phoneTrimmed) {
    return { success: false, error: "Số điện thoại liên hệ là bắt buộc." };
  }
  const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
  if (!vnPhoneRegex.test(phoneTrimmed)) {
    return { success: false, error: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (ví dụ: 0912345678)." };
  }
  
  try {
    const updated = await prisma.fishingLake.update({
      where: { id: lakeId },
      data: {
        name: data.name,
        address: data.address,
        phone: phoneTrimmed,
      }
    });

    // Sync user phone number too
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone: phoneTrimmed }
    });

    // Record activity log
    await recordActivityLog(session.user.id, "UPDATE_LAKE", {
      name: data.name,
      phone: data.phone,
      context: "onboarding"
    });

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update lake details" };
  }
}

