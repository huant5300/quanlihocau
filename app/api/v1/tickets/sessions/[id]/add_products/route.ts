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
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ success: false, message: "Danh sách sản phẩm không hợp lệ" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current unpaid invoice for the session
      let invoice = await tx.invoice.findFirst({
        where: { sessionId: id, status: "UNPAID" }
      });

      // 2. If no unpaid invoice exists, create one (should normally exist if session is active)
      if (!invoice) {
        const fishingSession = await tx.fishingSession.findUnique({ where: { id } });
        invoice = await tx.invoice.create({
          data: {
            invoiceNumber: `INV-${Date.now()}`,
            sessionId: id,
            customerId: fishingSession?.customerId,
            subtotal: 0,
            totalAmount: 0,
            status: "UNPAID",
          }
        });
      }

      let additionalTotal = 0;

      // 3. Process products
      for (const item of products) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const quantity = Number(item.quantity);
          const unitPrice = Number(item.unitPrice || product.price);
          const totalPrice = unitPrice * quantity;
          additionalTotal += totalPrice;

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
              note: `Bổ sung vào lượt câu ${id}`
            }
          });
        }
      }

      // 4. Update invoice total
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal: { increment: additionalTotal },
          totalAmount: { increment: additionalTotal }
        }
      });

      return updatedInvoice;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Add Products Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
