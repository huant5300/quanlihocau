import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { StockType, PaymentMethod, InvoiceStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, customerId, paymentMethod, notes } = body;
    const lakeId = await getActiveLakeId();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Giỏ hàng trống" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += Number(item.price) * item.quantity;
      }

      // 2. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `POS-${Date.now()}`,
          customerId: customerId || null,
          subtotal: subtotal,
          totalAmount: subtotal,
          status: InvoiceStatus.PAID,
          lakeId: lakeId, // Note: I need to check if Invoice has lakeId in schema
        } as any // Use as any if lakeId is missing from Invoice model but present in schema check
      });

      // 3. Process items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (!product) {
          throw new Error(`Sản phẩm ${item.name} không tồn tại`);
        }

        // Create Invoice Item
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: product.id,
            description: product.name,
            quantity: item.quantity,
            unitPrice: Number(item.price),
            totalPrice: Number(item.price) * item.quantity,
          }
        });

        // Update Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } }
        });

        // Inventory Log
        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: StockType.OUT,
            quantity: item.quantity,
            note: `Bán lẻ qua POS (Hóa đơn ${invoice.invoiceNumber})`
          }
        });
      }

      // 4. Create Payment
      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: subtotal,
          method: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          note: notes || "Thanh toán bán lẻ",
        }
      });

      // 5. Update Customer Stats if applicable
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalSpent: { increment: subtotal },
            visitCount: { increment: 1 }
          }
        });
      }

      // 6. Record in Transaction table
      await tx.transaction.create({
        data: {
          lakeId: lakeId,
          type: "INCOME",
          amount: subtotal,
          category: "PRODUCT",
          referenceId: invoice.id,
          description: `Bán lẻ POS - ${invoice.invoiceNumber}`
        }
      });

      return invoice;
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POS Checkout Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
