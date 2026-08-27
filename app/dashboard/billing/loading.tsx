import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-6 p-4 md:p-8 animate-pulse">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
