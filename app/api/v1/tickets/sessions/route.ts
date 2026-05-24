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
        FishingPackage: true,
        fishCatches: {
          include: { fishType: true }
        },
        invoices: {
          where: { status: "UNPAID" },
          include: { items: true }
        }
      },
      orderBy: { startTime: "desc" }
    });

    // Calculate real-time amount for each active session
    const calculatedSessions = sessions.map(session => {
      if (session.status !== "ACTIVE") return session;

      let sessionCost = 0;
      const now = new Date();
      const startTime = new Date(session.startTime);
      const diffMs = now.getTime() - startTime.getTime();
      const diffMins = Math.max(0, Math.floor(diffMs / 60000));

      if (session.customPrice) {
        sessionCost = Number(session.customPrice);
        const customMins = (session.customDuration || 0) * 60;
        if (customMins > 0 && diffMins > customMins) {
          const overtimeHours = Math.ceil((diffMins - customMins) / 60);
          sessionCost += overtimeHours * Number(session.hourlyRate);
        }
      } else if (session.FishingPackage) {
        sessionCost = Number(session.FishingPackage.price);
        // Basic overtime logic: if over package duration, add hourly rate for extra hours
        const packageMins = session.FishingPackage.durationHours * 60;
        if (diffMins > packageMins) {
          const overtimeHours = Math.ceil((diffMins - packageMins) / 60);
          sessionCost += overtimeHours * Number(session.hourlyRate);
        }
      } else {
        const hours = Math.ceil(diffMins / 60) || 1;
        sessionCost = hours * Number(session.hourlyRate);
      }

      const productsCost = session.invoices?.[0]?.items?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
      const buybackCredit = session.fishCatches?.reduce((sum, c) => sum + Number(c.totalAmount), 0) || 0;
      
      const currentTotal = sessionCost + productsCost - buybackCredit;

      return {
        ...session,
        sessionAmount: currentTotal
      };
    });
    
    return NextResponse.json(calculatedSessions);
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
    const customPrice = body.customPrice !== undefined && body.customPrice !== null ? Number(body.customPrice) : null;
    const customDuration = body.customDuration !== undefined && body.customDuration !== null ? Number(body.customDuration) : null;

    // Chống thất thoát: Chỉ OWNER hoặc SUPER_ADMIN mới được đặt giá tùy chỉnh hoặc thời lượng tùy chỉnh
    const userRole = session_auth?.user?.role;
    if ((customPrice !== null || customDuration !== null) && 
        userRole !== "OWNER" && 
        userRole !== "SUPER_ADMIN" && 
        !isOwner) {
      return NextResponse.json({ 
        success: false, 
        message: "Bạn không có quyền thiết lập giá tùy chỉnh hoặc thời lượng tùy chỉnh. Chỉ Chủ Hồ mới có quyền này." 
      }, { status: 403 });
    }

    if (!areaId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin vị trí (khu vực/chòi)" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or Create Customer if phone exists
      let customerId = body.customerId;
      if (!customerId && phone) {
        // Find customer globally by phone number to prevent duplicate key database crashes
        const existingCustomer = await tx.customer.findUnique({ 
          where: { phone } 
        });
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
          // Optionally update lakeId connection if customer is visiting this lake for the first time
          if (!existingCustomer.lakeId) {
            await tx.customer.update({
              where: { id: existingCustomer.id },
              data: { lakeId }
            });
          }
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

      // 2. Calculate endTime if package or custom duration exists
      let endTime = null;
      if (packageId) {
        const pkg = await tx.fishingPackage.findUnique({ where: { id: packageId } });
        if (pkg) {
          endTime = new Date(new Date(startTime).getTime() + Number(pkg.durationHours) * 60 * 60 * 1000);
        }
      } else if (customDuration) {
        endTime = new Date(new Date(startTime).getTime() + customDuration * 60 * 60 * 1000);
      }

      // 3. Create the session
      const newSession = await tx.fishingSession.create({
        data: {
          lakeId,
          areaId,
          customerId,
          startTime: new Date(startTime),
          endTime,
          hourlyRate: Number(hourlyRate),
          packageId,
          status: "ACTIVE",
          prepaidAmount,
          sessionAmount: 0,
          customPrice,
          customDuration,
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
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Create Session Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
