"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function PosError({
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
      title="Lỗi tải giao diện POS bán lẻ"
      description="Không thể tải danh mục mặt hàng và giỏ hàng POS. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
