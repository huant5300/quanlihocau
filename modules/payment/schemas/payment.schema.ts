import { z } from "zod";

export const paymentSchema = z.object({
  paymentMethod: z.enum(["Cash", "Bank Transfer", "QR Payment"]),
  amountPaid: z.number().min(0, "Số tiền không hợp lệ"),
  notes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
