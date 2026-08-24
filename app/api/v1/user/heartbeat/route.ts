import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const seconds = Number(body.seconds);

    if (isNaN(seconds) || seconds <= 0 || seconds > 120) {
      return NextResponse.json({ success: false, message: "Invalid seconds value" }, { status: 400 });
    }

    // Check if user exists first to avoid P2025 (record not found for update)
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, appUsageTime: true },
    }).catch(() => null);

    if (!existingUser) {
      // User not in DB yet (e.g. after schema migration), skip silently
      return NextResponse.json({ success: true, appUsageTime: 0 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        appUsageTime: {
          increment: seconds,
        },
      },
      select: {
        id: true,
        appUsageTime: true,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      appUsageTime: updatedUser?.appUsageTime || 0,
    });
  } catch (error: any) {
    console.warn("[Heartbeat non-fatal]:", error?.message);
    return NextResponse.json({ success: true, appUsageTime: 0 });
  }
}
