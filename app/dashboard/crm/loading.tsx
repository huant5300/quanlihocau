import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CRMLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>

      <Skeleton className="h-16 w-full max-w-xl rounded-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}
