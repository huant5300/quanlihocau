"use client";

import React from "react";
import { Skeleton } from "@/components/shared/skeleton-loader";

export function ReportsSkeleton() {
  return (
    <div className="space-y-10">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-[2.5rem]" />
        ))}
      </div>

      {/* Main Chart Skeleton */}
      <div className="glass-card p-8 rounded-[3rem]">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-[350px] w-full rounded-2xl" />
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-[400px] rounded-[2.5rem]" />
        <Skeleton className="h-[400px] rounded-[2.5rem]" />
      </div>
    </div>
  );
}
