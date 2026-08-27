import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
  return (
    <div className="space-y-6 p-4 md:p-8 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
