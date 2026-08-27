import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShiftsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-8 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
}
