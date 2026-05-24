import { NextRequest, NextResponse } from "next/server";
import { CustomerRepository } from "@/repositories/customer-repository";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const customer = await CustomerRepository.findById(id);
    
    if (!customer) {
      return NextResponse.json({ success: false, message: "Không tìm thấy khách hàng" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.phone) {
      const existing = await prisma.customer.findFirst({
        where: { 
          phone: body.phone,
          id: { not: id }
        }
      });

      if (existing) {
        return NextResponse.json({ 
          success: false, 
          message: `Số điện thoại ${body.phone} đã được đăng ký bởi khách hàng "${existing.fullName}"` 
        }, { status: 400 });
      }
    }

    const customer = await CustomerRepository.update(id, {
      fullName: body.fullName || body.full_name,
      phone: body.phone,
      address: body.address,
      notes: body.notes,
    });
    
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await CustomerRepository.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
