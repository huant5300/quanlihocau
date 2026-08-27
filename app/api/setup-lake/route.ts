import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, address } = await req.json();

    if (!name || !phone || !address) {
      return NextResponse.json({ error: "Vui lòng cung cấp đầy đủ thông tin" }, { status: 400 });
    }

    // Kiểm tra SĐT đã tồn tại chưa (1 Hồ = 1 SĐT Duy nhất)
    const existingLake = await prisma.fishingLake.findFirst({
      where: { phone },
    });

    if (existingLake) {
      return NextResponse.json(
        { error: "ERR_PHONE_EXISTS: Số điện thoại này đã được đăng ký cho một hồ câu khác." },
        { status: 400 }
      );
    }

    // Cập nhật hoặc tạo mới hồ câu cho user
    // Nếu user đã là OWNER nhưng chưa có hồ, tạo hồ mới
    let lakeId = session.user.lakeId;
    
    if (!lakeId) {
       const newLake = await prisma.fishingLake.create({
         data: {
           name,
           phone,
           address,
           managerId: session.user.id,
           subscriptionPlan: "BASIC",
           subscriptionStatus: "ACTIVE",
         }
       });
       
       lakeId = newLake.id;

       // Cập nhật lại user
       await prisma.user.update({
         where: { id: session.user.id },
         data: {
           lakeId: newLake.id,
           role: "OWNER",
         }
       });
    } else {
       await prisma.fishingLake.update({
         where: { id: lakeId },
         data: {
           name,
           phone,
           address,
         }
       });
    }

    return NextResponse.json({ success: true, lakeId });
  } catch (error: any) {
    console.error("Setup Lake Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
  }
}
