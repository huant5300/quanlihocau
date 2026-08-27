import { z } from "zod";

export const lakeSettingsSchema = z.object({
  name: z.string().trim().min(1, "Tên hồ bắt buộc nhập"),
  address: z.string().default(""),
  phone: z.string().trim().min(8, "Số điện thoại liên hệ phải có ít nhất 8 chữ số"),
  receiptFooter: z.string().default(""),
  bankName: z.string().default(""),
  bankAccount: z.string().default(""),
  bankHolder: z.string().default(""),
  bankBin: z.string().default(""),
});

export type LakeSettingsInput = z.infer<typeof lakeSettingsSchema>;
