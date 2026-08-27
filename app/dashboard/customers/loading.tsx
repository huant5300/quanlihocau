import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="space-y-6 p-4 md:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3">
        <Skeleton className="h-10 w-72 rounded-xl mb-4" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
