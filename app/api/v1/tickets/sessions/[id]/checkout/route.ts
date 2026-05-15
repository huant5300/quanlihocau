import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { differenceInMinutes } from "date-fns";

export async function POST(
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
    const { paymentMethod, notes } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the session with all details
      const fishingSession = await tx.fishingSession.findUnique({
        where: { id },
        include: {
          area: true,
          customer: true,
          invoices: {
            where: { status: "UNPAID" },
            include: { items: true }
          },
          fishCatches: true,
          FishingPackage: true
        }
      });

      if (!fishingSession || fishingSession.status !== "ACTIVE") {
        throw new Error("Lượt câu không khả dụng hoặc đã thanh toán");
      }

      const endTime = new Date();
      const startTime = new Date(fishingSession.startTime);
      const totalMinutes = differenceInMinutes(endTime, startTime);
      
      // 2. Calculate Session Cost
      let sessionCost = 0;
      if (fishingSession.FishingPackage) {
        sessionCost = Number(fishingSession.FishingPackage.price);
        // Handle overtime if any (simplified: charge per hour extra)
        const packageMinutes = fishingSession.FishingPackage.durationHours * 60;
        if (totalMinutes > packageMinutes) {
          const overtimeMinutes = totalMinutes - packageMinutes;
          const overtimeHours = Math.ceil(overtimeMinutes / 60);
          sessionCost += overtimeHours * Number(fishingSession.hourlyRate);
        }
      } else {
        // Hourly rate
        const totalHours = Math.ceil(totalMinutes / 60);
        sessionCost = totalHours * Number(fishingSession.hourlyRate);
      }

      // 3. Calculate Products Cost (from unpaid invoices)
      const currentInvoice = fishingSession.invoices[0];
      const productCost = currentInvoice?.items.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;

      // 4. Calculate Buyback Credit
      const buybackCredit = fishingSession.fishCatches.reduce((sum, catchItem) => sum + Number(catchItem.totalAmount), 0) || 0;

      // 5. Final Total
      const totalAmount = sessionCost + productCost - buybackCredit;

      // 6. Update Session
      const updatedSession = await tx.fishingSession.update({
        where: { id },
        data: {
          status: "COMPLETED",
          endTime,
          totalHours: totalMinutes / 60,
          sessionAmount: totalAmount,
        }
      });

      // 7. Update Area Status
      await tx.fishingArea.update({
        where: { id: fishingSession.areaId },
        data: { status: "AVAILABLE" }
      });

      // 8. Finalize Invoice & Payment
      if (currentInvoice) {
        // Add session cost as an item to the invoice
        await tx.invoiceItem.create({
          data: {
            invoiceId: currentInvoice.id,
            description: `Tiền giờ câu (${Math.ceil(totalMinutes / 60)}h)`,
            quantity: 1,
            unitPrice: sessionCost,
            totalPrice: sessionCost,
          }
        });

        // Add buyback as a negative item
        if (buybackCredit > 0) {
          await tx.invoiceItem.create({
            data: {
              invoiceId: currentInvoice.id,
              description: `Khấu trừ thu cá`,
              quantity: 1,
              unitPrice: -buybackCredit,
              totalPrice: -buybackCredit,
            }
          });
        }

        const finalInvoice = await tx.invoice.update({
          where: { id: currentInvoice.id },
          data: {
            subtotal: sessionCost + productCost,
            totalAmount: totalAmount,
            status: "PAID",
          }
        });

        // Create Payment record for the REMAINING amount
        const remainingAmount = totalAmount - Number(fishingSession.prepaidAmount || 0);
        
        await tx.payment.create({
          data: {
            invoiceId: finalInvoice.id,
            amount: remainingAmount,
            method: paymentMethod || "CASH",
            note: notes || (remainingAmount < 0 ? "Hoàn tiền cho khách" : "Thanh toán cuối lượt"),
          }
        });

        // 9. Record in Transaction table
        await tx.transaction.create({
          data: {
            lakeId: fishingSession.lakeId,
            type: "INCOME",
            amount: totalAmount,
            category: "SESSION",
            referenceId: updatedSession.id,
            description: `Thanh toán lượt câu - Chòi ${fishingSession.area.name} - ${fishingSession.customer?.fullName || "Khách lẻ"}`
          }
        });
      }

      return updatedSession;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
