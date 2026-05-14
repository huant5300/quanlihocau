import { NextRequest, NextResponse } from "next/server";
import { CustomerRepository } from "@/repositories/customer-repository";
import { getActiveLakeId } from "@/lib/lake-context";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    const customers = await CustomerRepository.getAll(lakeId);
    
    return NextResponse.json(customers);
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

    const customer = await CustomerRepository.create({
      fullName: body.fullName || body.full_name,
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
