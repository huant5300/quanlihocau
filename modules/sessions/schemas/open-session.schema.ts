import { z } from "zod";

export const openSessionSchema = z.object({
  phone_number: z.string().optional().refine((val) => !val || val.length >= 10, {
    message: "Số điện thoại không hợp lệ (ít nhất 10 số)",
  }),
  customer_name: z.string().optional(),
  hut_id: z.string().min(1, "Vui lòng chọn ô câu"),
  package_id: z.string().min(1, "Vui lòng chọn gói câu"),
  products: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
    name: z.string().optional()
  })),
  prepaid_amount: z.number(),
  should_print: z.boolean(),
  is_custom_package: z.boolean().optional(),
  custom_hours: z.number().optional(),
  custom_price: z.number().optional(),
});

export type OpenSessionInput = z.infer<typeof openSessionSchema>;
