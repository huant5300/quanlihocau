"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function ShiftsError({
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
      title="Lỗi tải thông tin ca trực"
      description="Không thể tải lịch sử và số dư bàn giao ca trực. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
