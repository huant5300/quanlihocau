import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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
    const { hours, cost } = body;

    const fishingSession = await prisma.fishingSession.findUnique({
      where: { id },
      include: { invoices: { where: { status: "UNPAID" } } }
    });

    if (!fishingSession) {
      return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
    }

    // Update the session or invoice
    const result = await prisma.$transaction(async (tx) => {
      // 1. If there's an active invoice, add the extension cost
      const invoice = fishingSession.invoices[0];
      if (invoice) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: `Gia hạn ${hours} giờ`,
            quantity: 1,
            unitPrice: cost,
            totalPrice: cost,
          }
        });

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            subtotal: { increment: cost },
            totalAmount: { increment: cost }
          }
        });
      }

      // 2. Note the extension in the session (optional)
      return await tx.fishingSession.update({
        where: { id },
        data: {
          notes: fishingSession.notes 
            ? `${fishingSession.notes}\nGia hạn +${hours}h (${cost}đ)` 
            : `Gia hạn +${hours}h (${cost}đ)`
        }
      });
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Extend Session Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
