import { z } from "zod";

export const lakeSettingsSchema = z.object({
  name: z.string().min(2, "Tên hồ phải ít nhất 2 ký tự"),
  address: z.string().min(5, "Địa chỉ không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  receiptFooter: z.string().optional(),
});

export type LakeSettingsInput = z.infer<typeof lakeSettingsSchema>;
