"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordActivityLog } from "@/lib/activity-log";
import { getVnStartOfToday } from "@/utils/datetime";

export async function getShiftSummaryAction() {
  try {
    const lakeId = await getActiveLakeId();
    const today = getVnStartOfToday();

    // Get all transactions today
    const [
      incomeTransactions,
      sessionCount,
      productSales,
      payments,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          lakeId,
          type: "INCOME",
          createdAt: { gte: today },
        },
        select: {
          amount: true,
          category: true,
          paymentMethod: true,
        },
      }),
      prisma.fishingSession.count({
        where: {
          lakeId,
          createdAt: { gte: today },
        },
      }),
      prisma.invoiceItem.findMany({
        where: {
          invoice: {
            lakeId,
            createdAt: { gte: today },
          },
          productId: { not: null },
        },
        select: {
          totalPrice: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: today },
          invoice: { lakeId },
        },
        select: {
          amount: true,
          method: true,
        },
      }),
    ]);

    const ticketRevenue = incomeTransactions
      .filter((t) => t.category === "SESSION")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const productRevenue = incomeTransactions
      .filter((t) => t.category === "PRODUCT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCash = payments
      .filter((p) => p.method === "CASH")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalTransfer = payments
      .filter((p) => p.method === "TRANSFER")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      success: true,
      data: {
        ticketRevenue,
        productRevenue,
        totalCash,
        totalTransfer,
        totalRevenue,
        sessionCount,
        expectedCash: totalCash,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function closeShiftAction(data: {
  actualCash: number;
  notes?: string;
}) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      throw new Error("Chưa đăng nhập");
    }

    const lakeId = await getActiveLakeId();
    const summary = await getShiftSummaryAction();

    if (!summary.success || !summary.data) {
      throw new Error("Không thể lấy dữ liệu ca");
    }

    const {
      ticketRevenue,
      productRevenue,
      totalCash,
      totalTransfer,
      expectedCash,
    } = summary.data;

    const discrepancy = data.actualCash - expectedCash;
    const status = Math.abs(discrepancy) > 1000 ? "FLAGGED" : "CLOSED";

    const shiftClose = await prisma.shiftClose.create({
      data: {
        lakeId,
        userId: sessionAuth.user.id,
        ticketRevenue,
        productRevenue,
        totalCash,
        totalTransfer,
        expectedCash,
        actualCash: data.actualCash,
        discrepancy,
        notes: data.notes,
        status,
      },
    });

    // Log activity
    await recordActivityLog(
      sessionAuth.user.id,
      status === "FLAGGED" ? "SHIFT_CLOSE_FLAGGED" : "SHIFT_CLOSE",
      {
        shiftCloseId: shiftClose.id,
        ticketRevenue,
        productRevenue,
        totalCash,
        totalTransfer,
        expectedCash,
        actualCash: data.actualCash,
        discrepancy,
      },
      { lakeId, entityType: "SHIFT", entityId: shiftClose.id }
    );

    // If flagged, create notification for OWNER
    if (status === "FLAGGED") {
      const lake = await prisma.fishingLake.findUnique({
        where: { id: lakeId },
        select: { managerId: true },
      });

      if (lake?.managerId) {
        await prisma.notification.create({
          data: {
            userId: lake.managerId,
            title: "⚠️ Kết ca có chênh lệch",
            message: `Nhân viên ${sessionAuth.user.name || sessionAuth.user.email} kết ca với chênh lệch ${discrepancy.toLocaleString()}đ. Tiền mặt kỳ vọng: ${expectedCash.toLocaleString()}đ, thực tế: ${data.actualCash.toLocaleString()}đ.`,
            type: "WARNING",
          },
        });
      }
    }

    revalidatePath("/dashboard/shift-close");
    revalidatePath("/dashboard");
    return { success: true, data: shiftClose };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getShiftHistoryAction() {
  try {
    const lakeId = await getActiveLakeId();

    const shifts = await prisma.shiftClose.findMany({
      where: { lakeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return {
      success: true,
      data: shifts.map((s) => ({
        id: s.id,
        shiftDate: s.shiftDate.toISOString(),
        ticketRevenue: Number(s.ticketRevenue),
        productRevenue: Number(s.productRevenue),
        totalCash: Number(s.totalCash),
        totalTransfer: Number(s.totalTransfer),
        expectedCash: Number(s.expectedCash),
        actualCash: Number(s.actualCash),
        discrepancy: Number(s.discrepancy),
        status: s.status,
        notes: s.notes,
        userName: s.user.name || s.user.email || "N/A",
        createdAt: s.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
