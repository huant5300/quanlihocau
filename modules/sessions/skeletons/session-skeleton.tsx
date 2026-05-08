"use client";

import React from "react";
import { Skeleton } from "@/components/shared/skeleton-loader";

export function SessionCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-[2.5rem] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="bg-muted/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </div>
  );
}

export function SessionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SessionCardSkeleton key={i} />
      ))}
    </div>
  );
}
