/**
 * Standard SaaS Error Codes & Vietnamese User Messages (PRD.md Section 6.2)
 */

export const SAAS_ERRORS = {
  ERR_MISSING_LAKE_CONTEXT: {
    code: "ERR_MISSING_LAKE_CONTEXT",
    message: "Lỗi hệ thống: Không xác định được hồ câu hiện tại. Vui lòng đăng nhập lại.",
  },
  ERR_PHONE_EXISTS: {
    code: "ERR_PHONE_EXISTS",
    message: "Số điện thoại này đã được đăng ký cho một hồ câu khác. Vui lòng sử dụng số điện thoại khác.",
  },
  ERR_SUBSCRIPTION_EXPIRED: {
    code: "ERR_SUBSCRIPTION_EXPIRED",
    message: "Gói dịch vụ của bạn đã hết hạn hoặc bị tạm khóa. Vui lòng gia hạn để tiếp tục sử dụng tính năng này.",
  },
  ERR_PERMISSION_DENIED: {
    code: "ERR_PERMISSION_DENIED",
    message: "Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Chủ hồ.",
  },
  ERR_OFFLINE_SYNC_FAILED: {
    code: "ERR_OFFLINE_SYNC_FAILED",
    message: "Mạng không ổn định, dữ liệu đã được lưu tạm trên máy và sẽ tự động đồng bộ khi có mạng lại.",
  },
  ERR_NOT_FOUND: {
    code: "ERR_NOT_FOUND",
    message: "Không tìm thấy dữ liệu yêu cầu hoặc đã bị xóa.",
  },
  ERR_LIMIT_EXCEEDED: {
    code: "ERR_LIMIT_EXCEEDED",
    message: "Đã vượt quá giới hạn tài nguyên của gói dịch vụ hiện tại. Vui lòng nâng cấp gói.",
  },
} as const;

export type SaasErrorCode = keyof typeof SAAS_ERRORS;

export class SaasError extends Error {
  public code: string;

  constructor(errorCode: SaasErrorCode, customMessage?: string) {
    const errorDef = SAAS_ERRORS[errorCode];
    super(customMessage || errorDef.message);
    this.name = "SaasError";
    this.code = errorDef.code;
  }
}
