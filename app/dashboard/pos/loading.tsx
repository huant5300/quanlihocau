import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PosLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8 animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}
