"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function SessionsError({
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
      title="Lỗi tải danh sách ca câu"
      description="Không thể tải dữ liệu ca câu thời gian thực. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
