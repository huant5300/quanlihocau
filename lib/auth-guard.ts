import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export interface AuthenticatedUserContext {
  userId: string;
  lakeId: string;
  role: UserRole;
  email?: string | null;
  name?: string | null;
}

/**
 * Server Action / API Guard: Yêu cầu đăng nhập và lấy context Multi-tenant
 */
export async function requireAuth(): Promise<
  | { success: true; user: AuthenticatedUserContext }
  | { success: false; error: string; statusCode: number }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Vui lòng đăng nhập để tiếp tục", statusCode: 401 };
  }

  const role = (session.user.role as UserRole) || UserRole.STAFF;
  let lakeId = session.user.lakeId;

  if (!lakeId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lakeId: true, role: true },
    });

    if (user?.lakeId) {
      lakeId = user.lakeId;
    } else if (role === UserRole.OWNER || role === UserRole.MANAGER) {
      const managedLake = await prisma.fishingLake.findFirst({
        where: { managerId: session.user.id },
        select: { id: true },
      });
      if (managedLake) {
        lakeId = managedLake.id;
      }
    }
  }

  if (!lakeId && role !== UserRole.SUPER_ADMIN) {
    return {
      success: false,
      error: "Tài khoản chưa được gán vào hồ câu hợp lệ.",
      statusCode: 403,
    };
  }

  return {
    success: true,
    user: {
      userId: session.user.id,
      lakeId: lakeId || "",
      role,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

/**
 * Server Action / API Guard: Yêu cầu quyền hạn (RBAC) cụ thể (vd: OWNER, SUPER_ADMIN)
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<
  | { success: true; user: AuthenticatedUserContext }
  | { success: false; error: string; statusCode: number }
> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { role } = authResult.user;
  if (role === UserRole.SUPER_ADMIN) {
    return authResult;
  }

  if (!allowedRoles.includes(role)) {
    return {
      success: false,
      error: "Bạn không có quyền hạn thực hiện thao tác quản trị này.",
      statusCode: 403,
    };
  }

  return authResult;
}

/**
 * Lấy và xác thực thông tin người dùng đang đăng nhập cùng lakeId tương ứng cho Route Handlers.
 */
export async function getAuthLakeContext(
  isWriteOperation: boolean = false
): Promise<
  { success: true; context: AuthenticatedUserContext; lake: any } | { success: false; response: NextResponse }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 }),
    };
  }

  const role = (session.user.role as UserRole) || UserRole.STAFF;
  let lakeId = session.user.lakeId;

  if (!lakeId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lakeId: true, role: true },
    });

    if (user?.lakeId) {
      lakeId = user.lakeId;
    } else if (role === UserRole.OWNER || role === UserRole.MANAGER) {
      const managedLake = await prisma.fishingLake.findFirst({
        where: { managerId: session.user.id },
        select: { id: true },
      });
      if (managedLake) {
        lakeId = managedLake.id;
      }
    }
  }

  if (!lakeId && role !== UserRole.SUPER_ADMIN) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Tài khoản chưa được gán vào hồ câu hợp lệ." },
        { status: 403 }
      ),
    };
  }

  let lake = null;
  if (lakeId) {
    lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
    });

    if (lake && isWriteOperation) {
      if (
        lake.subscriptionStatus === SubscriptionStatus.EXPIRED ||
        lake.subscriptionStatus === SubscriptionStatus.SUSPENDED
      ) {
        return {
          success: false,
          response: NextResponse.json(
            {
              success: false,
              error:
                "ERR_SUBSCRIPTION_EXPIRED: Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng này.",
            },
            { status: 403 }
          ),
        };
      }
    }
  }

  return {
    success: true,
    context: {
      userId: session.user.id,
      lakeId: lakeId || "",
      role: role,
      email: session.user.email,
    },
    lake,
  };
}

export async function checkRoleAccess(allowedRoles: UserRole[], userRole: UserRole): Promise<boolean> {
  if (!allowedRoles.includes(userRole) && userRole !== UserRole.SUPER_ADMIN) {
    return false;
  }
  return true;
}
