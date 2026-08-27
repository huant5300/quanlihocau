"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function BillingError({
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
      title="Lỗi tải thông tin gói cước SaaS"
      description="Không thể tải dữ liệu bản quyền và chu kỳ thanh toán. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
