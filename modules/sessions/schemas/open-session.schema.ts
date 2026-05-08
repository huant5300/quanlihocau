import { z } from "zod";

export const openSessionSchema = z.object({
  phone_number: z.string().min(10, "Số điện thoại không hợp lệ"),
  customer_name: z.string().min(2, "Tên khách hàng quá ngắn"),
  hut_id: z.string().min(1, "Vui lòng chọn chòi"),
  package_id: z.string().min(1, "Vui lòng chọn gói câu"),
  products: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
    price: z.number()
  })),
});

export type OpenSessionInput = z.infer<typeof openSessionSchema>;
