"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { getActiveLakeId } from "@/lib/lake-context";

export async function getStaffMembers(lakeId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const targetLakeId = lakeId || await getActiveLakeId();
    const staff = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.STAFF, UserRole.CASHIER] },
        lakeId: targetLakeId,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: staff };
  } catch (error) {
    return { success: false, error: "Failed to fetch staff" };
  }
}

export async function createStaffMember(data: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
}) {
  const session = await auth();
  if (!session || (session.user.role !== UserRole.OWNER && session.user.role !== UserRole.SUPER_ADMIN)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const currentLakeId = await getActiveLakeId();
    if (!currentLakeId) {
      return { success: false, error: "Không tìm thấy hồ câu hoạt động để gán nhân viên" };
    }

    const password = data.password || "123456";
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        lakeId: currentLakeId,
      },
    });
    
    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard/settings");
    return { success: true, data: user };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Email hoặc Số điện thoại đã được đăng ký" };
    }
    return { success: false, error: "Failed to create staff" };
  }
}

export async function updateStaffMember(id: string, data: Partial<{
  name: string;
  role: UserRole;
  isActive: boolean;
}>) {
  const session = await auth();
  if (!session || (session.user.role !== UserRole.OWNER && session.user.role !== UserRole.SUPER_ADMIN)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/staff");
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to update staff" };
  }
}
