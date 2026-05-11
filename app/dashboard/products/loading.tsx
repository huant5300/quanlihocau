import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
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

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <Skeleton className="h-14 w-full max-w-md rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-64 rounded-[2rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
