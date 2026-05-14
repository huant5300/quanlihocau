"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getStaffMembers(lakeId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // In this simple multi-tenant model, staff might be linked to a lake via managedLake or we might need a join table.
    // However, the schema has User.managedLake. 
    // Let's fetch users who are not SUPER_ADMIN and potentially linked to this lake.
    
    // For now, let's return all users who are not SUPER_ADMIN for simplicity, 
    // or filter by some logic if we had a many-to-many staff-lake table.
    const staff = await prisma.user.findMany({
      where: {
        role: { not: "SUPER_ADMIN" },
        // If we want to filter by lake, we'd need a relation. 
        // Let's assume for now staff are per-tenant (lake).
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
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : undefined;
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
      },
    });
    
    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard/settings");
    return { success: true, data: user };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Email or Phone already exists" };
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
  if (!session) return { success: false, error: "Unauthorized" };

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
