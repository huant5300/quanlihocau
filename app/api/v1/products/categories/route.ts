import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let categories = await prisma.productCategory.findMany({
      orderBy: { name: "asc" }
    });

    if (categories.length === 0) {
      await prisma.productCategory.createMany({
        data: [
          { name: "Mồi câu & Thính" },
          { name: "Đồ uống & Giải khát" },
          { name: "Đồ ăn & Thức ăn nhanh" },
          { name: "Dụng cụ câu cá" },
          { name: "Dịch vụ khác" },
        ],
        skipDuplicates: true,
      }).catch(() => null);

      categories = await prisma.productCategory.findMany({
        orderBy: { name: "asc" }
      });
    }
    
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
