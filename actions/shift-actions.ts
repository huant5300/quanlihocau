"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordActivityLog } from "@/lib/activity-log";

export async function getActiveShiftSession() {
  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) return { success: true, data: null };

    const activeShift = await prisma.shiftSession.findFirst({
      where: {
        lakeId,
        status: "RUNNING",
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true },
        },
      },
    });

    if (!activeShift) return { success: true, data: null };

    // Calculate real-time stats for the running shift
    const summary = await getShiftSummary(activeShift.id);
    
    return {
      success: true,
      data: {
        ...activeShift,
        summary: summary.success ? summary.data : null,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function startShiftSession(notes?: string) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      throw new Error("Chưa đăng nhập");
    }

    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      throw new Error("Không tìm thấy hồ câu hoạt động");
    }

    // Check if there is already a running shift
    const existing = await prisma.shiftSession.findFirst({
      where: {
        lakeId,
        status: "RUNNING",
      },
    });

    if (existing) {
      throw new Error("Đã có ca làm việc đang hoạt động. Vui lòng chốt ca hiện tại trước.");
    }

    const shift = await prisma.shiftSession.create({
      data: {
        lakeId,
        userId: sessionAuth.user.id,
        status: "RUNNING",
        notes,
      },
    });

    await recordActivityLog(
      sessionAuth.user.id,
      "SHIFT_START",
      { shiftId: shift.id },
      { lakeId, entityType: "SHIFT", entityId: shift.id }
    );

    revalidatePath("/dashboard/shifts");
    revalidatePath("/dashboard");
    return { success: true, data: shift };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getShiftSummary(shiftId: string) {
  try {
    const shift = await prisma.shiftSession.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new Error("Không tìm thấy ca làm việc");
    }

    const startTime = shift.startTime;
    const endTime = shift.endTime || new Date();
    const lakeId = shift.lakeId;

    // Fetch transactions inside the shift's timeframe
    const transactions = await prisma.transaction.findMany({
      where: {
        lakeId,
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
      },
      select: {
        amount: true,
        category: true,
        type: true,
      },
    });

    // Fetch payments inside the shift's timeframe
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
        invoice: {
          lakeId,
        },
      },
      select: {
        amount: true,
        method: true,
      },
    });

    const ticketRevenue = transactions
      .filter((t) => t.category === "SESSION" && t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const productRevenue = transactions
      .filter((t) => t.category === "PRODUCT" && t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCash = payments
      .filter((p) => p.method === "CASH")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalTransfer = payments
      .filter((p) => p.method === "TRANSFER")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalRevenue = ticketRevenue + productRevenue;

    return {
      success: true,
      data: {
        ticketRevenue,
        productRevenue,
        totalCash,
        totalTransfer,
        totalRevenue,
        expectedCash: totalCash,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function closeShiftSession(data: {
  shiftId: string;
  actualCash: number;
  notes?: string;
}) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      throw new Error("Chưa đăng nhập");
    }

    const summaryRes = await getShiftSummary(data.shiftId);
    if (!summaryRes.success || !summaryRes.data) {
      throw new Error(summaryRes.error || "Không thể tính toán doanh thu ca");
    }

    const { ticketRevenue, productRevenue, totalRevenue, expectedCash } = summaryRes.data;
    
    // Discrepancy is actual cash minus expected cash
    const discrepancy = data.actualCash - expectedCash;

    const shift = await prisma.shiftSession.update({
      where: { id: data.shiftId },
      data: {
        endTime: new Date(),
        status: "CLOSED",
        ticketRevenue,
        productRevenue,
        totalRevenue,
        notes: data.notes,
      },
    });

    // Record close activity log
    await recordActivityLog(
      sessionAuth.user.id,
      "SHIFT_CLOSE",
      {
        shiftId: shift.id,
        ticketRevenue,
        productRevenue,
        totalRevenue,
        expectedCash,
        actualCash: data.actualCash,
        discrepancy,
      },
      { lakeId: shift.lakeId, entityType: "SHIFT", entityId: shift.id }
    );

    // If there is discrepancy, notify Owner/Admin
    if (Math.abs(discrepancy) > 1000) {
      const lake = await prisma.fishingLake.findUnique({
        where: { id: shift.lakeId },
        select: { managerId: true },
      });

      if (lake?.managerId) {
        await prisma.notification.create({
          data: {
            userId: lake.managerId,
            title: "⚠️ Chênh lệch chốt ca",
            message: `Nhân viên ${sessionAuth.user.name || "N/A"} chốt ca có chênh lệch ${discrepancy.toLocaleString()}đ. Tiền mặt kỳ vọng: ${expectedCash.toLocaleString()}đ, thực tế: ${data.actualCash.toLocaleString()}đ.`,
            type: "WARNING",
          },
        });
      }
    }

    revalidatePath("/dashboard/shifts");
    revalidatePath("/dashboard");
    return { success: true, data: shift };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getShiftSessionsHistory() {
  try {
    const lakeId = await getActiveLakeId();
    if (!lakeId) return { success: true, data: [] };

    const shifts = await prisma.shiftSession.findMany({
      where: { lakeId },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true },
        },
      },
      orderBy: { startTime: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: shifts.map((s) => ({
        id: s.id,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime?.toISOString() || null,
        ticketRevenue: Number(s.ticketRevenue),
        productRevenue: Number(s.productRevenue),
        totalRevenue: Number(s.totalRevenue),
        status: s.status,
        notes: s.notes,
        staffName: s.user.name || s.user.username || s.user.email || "N/A",
        createdAt: s.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
