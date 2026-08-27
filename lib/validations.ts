import { z } from "zod";

/**
 * XSS & HTML Injection Sanitizer for text inputs
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Strip javascript: URIs
    .replace(/data:/gi, "") // Strip data: URIs
    .trim();
}

/**
 * Customer Schemas
 */
export const CustomerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập tên khách hàng")
    .max(100, "Tên khách hàng tối đa 100 ký tự")
    .transform(sanitizeString),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
  address: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

/**
 * Product & Stock Schemas
 */
export const ProductSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên sản phẩm")
    .max(150, "Tên sản phẩm tối đa 150 ký tự")
    .transform(sanitizeString),
  price: z.coerce.number().min(0, "Đơn giá không được âm"),
  stock: z.coerce.number().int().min(0, "Số lượng tồn kho không được âm").default(0),
  categoryId: z.string().optional().nullable(),
});

/**
 * Session Creation Schema
 */
export const OpenSessionSchema = z.object({
  areaId: z.string().min(1, "Vui lòng chọn ô / chòi câu"),
  packageId: z.string().optional().nullable(),
  customerName: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : "Khách lẻ")),
  customerPhone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
  customerId: z.string().optional().nullable(),
  hourlyRate: z.coerce.number().min(0, "Đơn giá giờ không hợp lệ"),
  prepaidAmount: z.coerce.number().min(0).default(0),
  products: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().min(1),
        unitPrice: z.coerce.number().min(0),
      })
    )
    .optional()
    .default([]),
});

/**
 * Session Checkout / Payment Schema
 */
export const CheckoutSchema = z.object({
  sessionId: z.string().min(1, "Thiếu mã ca câu"),
  totalAmount: z.coerce.number().min(0, "Số tiền thanh toán không hợp lệ"),
  paidAmount: z.coerce.number().min(0, "Số tiền đã trả không hợp lệ"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "DEBT"]).default("CASH"),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

/**
 * Shift Session Schemas
 */
export const ShiftOpenSchema = z.object({
  initialCash: z.coerce.number().min(0, "Tiền mặt đầu ca không hợp lệ").default(0),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

export const ShiftCloseSchema = z.object({
  sessionId: z.string().min(1, "Thiếu mã ca trực"),
  actualCash: z.coerce.number().min(0, "Tiền mặt kiểm đếm không hợp lệ"),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});
