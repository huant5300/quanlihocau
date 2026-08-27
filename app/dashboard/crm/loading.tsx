import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CrmLoading() {
  return (
    <div className="space-y-6 p-4 md:p-8 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-3xl" />
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
