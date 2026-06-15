import { z } from "zod";

export const openSessionSchema = z.object({
  start_time: z.string().min(1, "Vui lòng nhập giờ bắt đầu"), // HH:mm format
  package_id: z.string().min(1, "Vui lòng chọn gói câu"),
  hut_id: z.string().min(1, "Vui lòng chọn ô câu"),
  // Customer info (optional - Step 2)
  phone_number: z.string().optional().refine((val) => !val || val.length >= 10, {
    message: "Số điện thoại không hợp lệ (ít nhất 10 số)",
  }),
  customer_name: z.string().optional(),
  customer_id: z.string().optional(), // If existing customer selected
  // Optional extras (Step 3 confirmation)
  products: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
    name: z.string().optional()
  })).default([]),
  prepaid_amount: z.number().default(0),
  should_print: z.boolean().default(true),
  // Custom package fields
  is_custom_package: z.boolean().optional(),
  custom_hours: z.number().optional(),
  custom_price: z.number().optional(),
});

export type OpenSessionInput = z.input<typeof openSessionSchema>;
