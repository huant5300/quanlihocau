"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { recordActivityLog } from "@/lib/activity-log";
import { getActiveLakeId } from "@/lib/lake-context";

export async function getStaffMembers(lakeId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const targetLakeId = lakeId || await getActiveLakeId();
    const staff = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.STAFF, UserRole.CASHIER, UserRole.MANAGER] },
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
  username: string;
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
        username: data.username,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        lakeId: currentLakeId,
      },
    });
    
    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard/settings");

    // Record activity log
    if (session?.user?.id) {
      await recordActivityLog(session.user.id, "CREATE_STAFF", {
        staffId: user.id,
        staffName: user.name,
        username: user.username,
        role: user.role
      });
    }

    return { success: true, data: user };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Tên đăng nhập hoặc Số điện thoại đã được đăng ký" };
    }
    return { success: false, error: "Failed to create staff" };
  }
}

export async function updateStaffMember(id: string, data: Partial<{
  name: string;
  username: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  password?: string;
}>) {
  const session = await auth();
  if (!session || (session.user.role !== UserRole.OWNER && session.user.role !== UserRole.SUPER_ADMIN)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatePayload: any = { ...data };
    
    // Hash password if updating
    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 12);
    } else {
      delete updatePayload.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updatePayload,
    });
    
    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard/settings");

    // Record activity log
    if (session?.user?.id) {
      await recordActivityLog(session.user.id, "UPDATE_STAFF", {
        staffId: id,
        staffName: user.name,
        updates: Object.keys(data).filter(k => k !== "password")
      });
    }

    return { success: true, data: user };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Tên đăng nhập hoặc số điện thoại đã được đăng ký bởi người khác" };
    }
    return { success: false, error: "Failed to update staff" };
  }
}

export async function deleteStaffMember(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== UserRole.OWNER && session.user.role !== UserRole.SUPER_ADMIN)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.delete({
      where: { id }
    });
    
    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard/settings");

    // Record activity log
    if (session?.user?.id) {
      await recordActivityLog(session.user.id, "DELETE_STAFF", {
        staffId: id,
        staffName: user.name
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete staff member" };
  }
}

export async function getStaffActivityLogs(staffId: string) {
  const session = await auth();
  if (!session || (session.user.role !== UserRole.OWNER && session.user.role !== UserRole.SUPER_ADMIN)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: staffId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, data: logs };
  } catch (error: any) {
    console.error("Error fetching staff logs:", error);
    return { success: false, error: "Không thể lấy lịch sử hoạt động" };
  }
}
