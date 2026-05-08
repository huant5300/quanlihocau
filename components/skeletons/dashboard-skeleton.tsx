import { Skeleton } from "./skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-3xl" />
        ))}
      </div>

      {/* Charts / Large Blocks */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>

      {/* List / Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
