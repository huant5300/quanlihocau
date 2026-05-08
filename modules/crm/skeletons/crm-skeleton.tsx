"use client";

import React from "react";
import { Skeleton } from "@/components/shared/skeleton-loader";

export function CustomerCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-[2.5rem] flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function CustomerListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <CustomerCardSkeleton key={i} />
      ))}
    </div>
  );
}
