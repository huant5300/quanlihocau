import { z } from "zod";

export const fishBuybackSchema = z.object({
  fishType: z.enum(["Black Carp", "Grass Carp", "Catfish", "Tilapia", "Other"]),
  weight: z.number().min(0.1, "Khối lượng phải lớn hơn 0"),
  pricePerKg: z.number().min(1000, "Giá phải lớn hơn 1,000đ"),
  totalAmount: z.number(),
});

export type FishBuybackInput = z.infer<typeof fishBuybackSchema>;
