"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorBoundary
      error={error}
      reset={reset}
      title="Lỗi tải danh sách hóa đơn"
      description="Không thể tải lịch sử thanh toán & hóa đơn. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
