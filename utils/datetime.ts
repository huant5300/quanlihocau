/**
 * Helper xử lý múi giờ Việt Nam (GMT+7) để tránh lệch múi giờ (timezone drift) trên server chạy giờ UTC.
 */

/**
 * Trả về mốc thời gian bắt đầu ngày hôm nay (00:00:00) theo giờ Việt Nam (GMT+7),
 * được biểu diễn dưới dạng đối tượng Date chuẩn (UTC).
 */
export function getVnStartOfToday(): Date {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCHours(0, 0, 0, 0);
  return new Date(vnTime.getTime() - 7 * 60 * 60 * 1000);
}

/**
 * Trừ đi số ngày nhất định từ một mốc thời gian.
 */
export function getVnSubDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Trả về mốc bắt đầu tuần này (Thứ hai 00:00:00) theo giờ Việt Nam.
 */
export function getVnStartOfWeek(date: Date): Date {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  let day = vnTime.getUTCDay();
  // Chuyển Chủ Nhật (0) thành 7 để tính toán T2 (1) -> CN (7)
  if (day === 0) day = 7;
  vnTime.setUTCDate(vnTime.getUTCDate() - (day - 1));
  vnTime.setUTCHours(0, 0, 0, 0);
  return new Date(vnTime.getTime() - 7 * 60 * 60 * 1000);
}

/**
 * Trả về mốc bắt đầu tháng này (Ngày 1 00:00:00) theo giờ Việt Nam.
 */
export function getVnStartOfMonth(date: Date): Date {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(1);
  vnTime.setUTCHours(0, 0, 0, 0);
  return new Date(vnTime.getTime() - 7 * 60 * 60 * 1000);
}

/**
 * Trả về mốc bắt đầu năm này (Ngày 1/1 00:00:00) theo giờ Việt Nam.
 */
export function getVnStartOfYear(date: Date): Date {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCMonth(0);
  vnTime.setUTCDate(1);
  vnTime.setUTCHours(0, 0, 0, 0);
  return new Date(vnTime.getTime() - 7 * 60 * 60 * 1000);
}
