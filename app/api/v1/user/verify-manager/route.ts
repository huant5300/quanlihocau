import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Thiếu tên đăng nhập hoặc mật khẩu" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { username: username }
        ]
      }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Tài khoản quản lý không tồn tại" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu không chính xác" },
        { status: 400 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Tài khoản này đang bị khóa" },
        { status: 400 }
      );
    }

    const hasPrivilege =
      user.role === UserRole.OWNER ||
      user.role === UserRole.MANAGER ||
      user.role === UserRole.SUPER_ADMIN;

    if (!hasPrivilege) {
      return NextResponse.json(
        { success: false, message: "Tài khoản này không có quyền quản lý" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      managerId: user.id,
      name: user.name || user.username || user.email,
      role: user.role
    });
  } catch (error: any) {
    console.error("Verify Manager Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
