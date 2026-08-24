import { z } from "zod";

export const lakeSettingsSchema = z.object({
  name: z.string().trim().min(2, "Tên hồ bắt buộc nhập (tối thiểu 2 ký tự)"),
  address: z.string().trim().min(5, "Địa chỉ hồ bắt buộc nhập (tối thiểu 5 ký tự)"),
  phone: z
    .string()
    .trim()
    .min(1, "Số điện thoại liên hệ là bắt buộc")
    .regex(/^(0[35789])[0-9]{8}$/, "Số điện thoại không hợp lệ (gồm 10 số, VD: 0912345678)"),
  receiptFooter: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolder: z.string().optional(),
  bankBin: z.string().optional(),
});

export type LakeSettingsInput = z.infer<typeof lakeSettingsSchema>;
