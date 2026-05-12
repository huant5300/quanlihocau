import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CRMSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[2rem]" />
        ))}
      </div>
      
      <div className="glass-card p-8 rounded-[3rem] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-14 w-full md:w-96 rounded-2xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
