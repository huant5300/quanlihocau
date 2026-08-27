"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function CustomersError({
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
      title="Lỗi tải danh sách khách hàng"
      description="Không thể tải dữ liệu hội viên & cần thủ. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
