"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { setActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";

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
              recentTransactions
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
              })
            ]);

            return {
              id: lake.id,
              name: lake.name,
              address: lake.address,
              phone: lake.phone,
              totalSpots: lake.totalSpots,
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
              }))
            };
          })
        );

        return {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
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

