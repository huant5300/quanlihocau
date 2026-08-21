import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, AreaStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    // Validation
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp email hoặc số điện thoại" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    if (email) {
      const existingByEmail = await prisma.user.findFirst({ where: { email } });
      if (existingByEmail) {
        return NextResponse.json(
          { error: "Email này đã được đăng ký. Vui lòng đăng nhập." },
          { status: 409 }
        );
      }
    }

    // Check for duplicate phone
    if (phone) {
      const existingByPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingByPhone) {
        return NextResponse.json(
          { error: "Số điện thoại này đã được đăng ký. Vui lòng đăng nhập." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 7);

    const displayName = name?.trim() || "Chủ Hồ";

    // 1. Create user
    const user = await prisma.user.create({
      data: {
        name: displayName,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role: UserRole.OWNER,
        isActive: true,
      },
    });

    // 2. Create default lake with 7-day FREE trial
    const lake = await prisma.fishingLake.create({
      data: {
        name: `Hồ Câu ${displayName}`,
        description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
        address: "Chưa cập nhật",
        phone: phone || email || "Chưa cập nhật",
        managerId: user.id,
        totalSpots: 10,
        subscriptionPlan: "FREE",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: trialExpiry,
      },
    });

    // 3. Link user → lake
    await prisma.user.update({
      where: { id: user.id },
      data: { lakeId: lake.id },
    });

    // 4. Create 5 default fishing areas (chòi)
    await prisma.fishingArea.createMany({
      data: [1, 2, 3, 4, 5].map((n) => ({
        name: `Chòi ${n}`,
        lakeId: lake.id,
        status: AreaStatus.AVAILABLE,
        hourlyRate: 50000,
        capacity: 1,
        minDuration: 1,
      })),
    });

    // 5. Log the registration activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        details: {
          method: email ? "email" : "phone",
          trialDays: 7,
        },
      },
    });

    return NextResponse.json(
      { success: true, userId: user.id, lakeId: lake.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);

    // Prisma unique constraint violation
    if (error?.code === "P2002") {
      const field = error?.meta?.target?.[0];
      if (field === "email") {
        return NextResponse.json(
          { error: "Email đã được sử dụng." },
          { status: 409 }
        );
      }
      if (field === "phone") {
        return NextResponse.json(
          { error: "Số điện thoại đã được sử dụng." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Đăng ký thất bại. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
