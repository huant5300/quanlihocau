import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-14 w-40 rounded-2xl" />
        </div>
      </div>

      <div className="h-2 w-full bg-accent/20 rounded-full mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        <Skeleton className="h-80 rounded-[2.5rem]" />
        <Skeleton className="h-80 rounded-[2.5rem]" />
        <Skeleton className="h-80 rounded-[2.5rem] md:col-span-2" />
        
        <Skeleton className="h-80 rounded-[2.5rem]" />
        <Skeleton className="h-80 rounded-[2.5rem]" />
        <Skeleton className="h-80 rounded-[2.5rem] md:col-span-2" />
      </div>
    </div>
  );
}
