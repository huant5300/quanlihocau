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
    const customers = await CustomerRepository.getAll(lakeId);

    let filteredCustomers = customers;
    if (search) {
      const query = search.toLowerCase();
      filteredCustomers = customers.filter(c => 
        (c.fullName || "").toLowerCase().includes(query) || 
        (c.phone || "").includes(query)
      );
    }
    
    return NextResponse.json(filteredCustomers);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lakeId = await getActiveLakeId();

    if (!body.phone) {
      return NextResponse.json({ success: false, message: "Số điện thoại là bắt buộc" }, { status: 400 });
    }

    // Check unique phone globally to prevent duplicate key database crashes
    const existing = await prisma.customer.findUnique({
      where: { phone: body.phone }
    });

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        message: `Số điện thoại ${body.phone} đã được đăng ký bởi khách hàng "${existing.fullName}"` 
      }, { status: 400 });
    }

    const customer = await CustomerRepository.create({
      fullName: body.fullName || body.full_name || "Khách quen",
      phone: body.phone,
      address: body.address,
      notes: body.notes,
      lakeId: lakeId,
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
