import { NextRequest, NextResponse } from "next/server";
import { getActiveLakeId } from "@/lib/lake-context";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session_auth = await auth();
    const isOwner = session_auth?.user?.email === "huant5300@gmail.com";
    
    if (!session_auth && !isOwner) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    
    const lakeId = await getActiveLakeId();
    
    const sessions = await prisma.fishingSession.findMany({
      where: { 
        lakeId,
        status: status as any
      },
      include: {
        area: true,
        customer: true,
        fishCatches: {
          include: { fishType: true }
        }
      },
      orderBy: { startTime: "desc" }
    });
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session_auth = await auth();
    const isOwner = session_auth?.user?.email === "huant5300@gmail.com";

    if (!session_auth && !isOwner) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lakeId = await getActiveLakeId();

    const areaId = body.areaId || body.hut_id;
    const customerName = body.customer_name;
    const phone = body.phone;
    const startTime = body.startTime || new Date().toISOString();
    const hourlyRate = body.hourlyRate || 50000;
    const packageId = body.packageId;
    const prepaidAmount = Number(body.prepaidAmount || 0);

    if (!areaId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin vị trí (khu vực/chòi)" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or Create Customer if phone exists
      let customerId = body.customerId;
      if (!customerId && phone) {
        // Try to find customer by phone in this lake
        const existingCustomer = await tx.customer.findFirst({ 
          where: { 
            phone,
            OR: [
              { lakeId },
              { lakeId: null }
            ]
          } 
        });
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              fullName: customerName || "Khách lẻ",
              phone: phone,
              lakeId
            }
          });
          customerId = newCustomer.id;
        }
      }

      // 2. Create the session
      const newSession = await tx.fishingSession.create({
        data: {
          lakeId,
          areaId,
          customerId,
          startTime: new Date(startTime),
          hourlyRate: Number(hourlyRate),
          packageId,
          status: "ACTIVE",
          prepaidAmount,
          sessionAmount: 0,
        },
        include: {
          area: true,
          customer: true
        }
      });

      // 3. Update area status to OCCUPIED
      await tx.fishingArea.update({
        where: { id: areaId },
        data: { status: "OCCUPIED" }
      });

      // 4. Create initial invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sessionId: newSession.id,
          customerId: customerId,
          subtotal: 0,
          totalAmount: 0,
          status: "UNPAID",
          lakeId
        }
      });

      // 5. Handle initial products if any
      if (body.products && Array.isArray(body.products)) {
        let totalProductAmount = 0;
        for (const item of body.products) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const quantity = item.quantity || 1;
            const unitPrice = item.unitPrice || product.price;
            const totalPrice = Number(unitPrice) * quantity;
            totalProductAmount += totalPrice;

            await tx.invoiceItem.create({
              data: {
                invoiceId: invoice.id,
                productId: product.id,
                description: product.name,
                quantity,
                unitPrice,
                totalPrice,
              }
            });

            // Update stock
            await tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: quantity } }
            });

            // Log inventory
            await tx.inventoryTransaction.create({
              data: {
                productId: product.id,
                type: "OUT",
                quantity,
                note: `Bán kèm khi mở lượt câu ${newSession.id}`
              }
            });
          }
        }

        // Update invoice total
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { 
            subtotal: totalProductAmount,
            totalAmount: totalProductAmount
          }
        });
      }

      // 6. Record prepaid payment if any
      if (prepaidAmount > 0) {
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: prepaidAmount,
            method: "CASH",
            note: "Tiền tạm thu khi mở lượt câu",
          }
        });
      }

      return newSession;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Create Session Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
