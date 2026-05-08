"use client";

import React from "react";
import { Skeleton } from "@/components/shared/skeleton-loader";

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col gap-4">
      <Skeleton className="aspect-square w-full" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[...Array(10)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
