import { NextRequest, NextResponse } from "next/server";
import { CustomerRepository } from "@/repositories/customer-repository";
import { getActiveLakeId } from "@/lib/lake-context";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;

    const lakeId = await getActiveLakeId();
    const customers = await CustomerRepository.getAll(lakeId).catch((err) => {
      console.warn("[Customers GET] Fallback on error:", err.message);
      return [];
    });

    let filteredCustomers = customers || [];
    if (search) {
      const query = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c => 
        (c.fullName || "").toLowerCase().includes(query) || 
        (c.phone || "").includes(query)
      );
    }
    
    return NextResponse.json(filteredCustomers);
  } catch (error: any) {
    console.error("[Customers API GET Error]:", error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let lakeId = (await getActiveLakeId()) || "";

    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst();
      lakeId = firstLake?.id || "";
    }

    const fullName = (body.fullName || body.full_name || body.name || "Khách quen").trim();
    // Tạo số điện thoại tạm thời duy nhất nếu khách không có SĐT
    let phone = (body.phone || body.phone_number || "").trim();
    if (!phone) {
      phone = `KH_${Date.now().toString().slice(-8)}`;
    }

    // Kiểm tra xem số điện thoại đã tồn tại chưa trong hồ
    const existing = await prisma.customer.findFirst({
      where: { phone: phone, lakeId: lakeId || undefined }
    });

    if (existing) {
      // Cập nhật thông tin khách hàng hiện tại
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          fullName: fullName !== "Khách quen" ? fullName : existing.fullName,
          address: body.address || existing.address,
          notes: body.notes || existing.notes,
          lakeId: lakeId || existing.lakeId,
        }
      });

      return NextResponse.json({ 
        success: true,
        alreadyExisted: true,
        message: `Khách hàng "${updated.fullName}" (${phone}) đã có trong hệ thống, đã tự động chọn!`,
        ...updated
      }, { status: 200 });
    }

    // Tạo khách hàng mới
    const customer = await prisma.customer.create({
      data: {
        fullName: fullName,
        phone: phone,
        address: body.address || null,
        notes: body.notes || null,
        lakeId: lakeId,
        visitCount: 0,
        totalSpent: 0,
        debtBalance: 0,
      }
    });

    return NextResponse.json({
      success: true,
      ...customer
    });
  } catch (error: any) {
    console.error("[Customers API POST Error]:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Không thể tạo khách hàng, vui lòng thử lại" 
    }, { status: 500 });
  }
}
