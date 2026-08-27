import { z } from "zod";

export const fishBuybackSchema = z.object({
  fishTypeId: z.string().min(1, "Vui lòng chọn loại cá"),
  weight: z.number().min(0.1, "Khối lượng phải lớn hơn 0"),
  pricePerKg: z.number().min(1000, "Giá phải lớn hơn 1,000đ"),
  totalAmount: z.number(),
  isSoldBack: z.boolean(),
});

export type FishBuybackInput = z.infer<typeof fishBuybackSchema>;
