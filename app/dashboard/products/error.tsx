"use client";

import { RouteErrorBoundary } from "@/components/error-boundaries/route-error-boundary";

export default function ProductsError({
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
      title="Lỗi tải danh mục sản phẩm & kho"
      description="Không thể tải dữ liệu hàng hóa và tồn kho. Vui lòng bấm Thử lại để tải lại dữ liệu."
      backHref="/dashboard"
    />
  );
}
