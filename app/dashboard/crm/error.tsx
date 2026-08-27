"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function CrmError({
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
      title="Lỗi tải trung tâm chăm sóc khách hàng CRM"
      description="Không thể tải dữ liệu phân hạng hội viên và tích điểm. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
