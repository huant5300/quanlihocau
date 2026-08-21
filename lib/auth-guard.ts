import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export interface AuthenticatedUserContext {
  userId: string;
  lakeId: string;
  role: UserRole;
  email?: string | null;
}

/**
 * Lấy và xác thực thông tin người dùng đang đăng nhập cùng lakeId tương ứng.
 * Nếu không hợp lệ, trả về Response lỗi 401 hoặc 403.
 */
export async function getAuthLakeContext(): Promise<
  { success: true; context: AuthenticatedUserContext } | { success: false; response: NextResponse }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }),
    };
  }

  const role = (session.user.role as UserRole) || UserRole.STAFF;
  let lakeId = session.user.lakeId;

  // Nếu trong session chưa có lakeId, tìm từ database
  if (!lakeId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lakeId: true, role: true },
    });

    if (user?.lakeId) {
      lakeId = user.lakeId;
    } else if (role === UserRole.OWNER) {
      const managedLake = await prisma.fishingLake.findFirst({
        where: { managerId: session.user.id },
        select: { id: true },
      });
      if (managedLake) {
        lakeId = managedLake.id;
      }
    }
  }

  // Super Admin có thể thao tác mà không bị giới hạn 1 hồ cố định nếu có header riêng
  if (!lakeId && role !== UserRole.SUPER_ADMIN) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Tài khoản chưa được liên kết với hồ câu nào" },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    context: {
      userId: session.user.id,
      lakeId: lakeId || "",
      role: role,
      email: session.user.email,
    },
  };
}
