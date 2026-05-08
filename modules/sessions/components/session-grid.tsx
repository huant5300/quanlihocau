"use client";

import React from "react";
import { cn } from "@/utils/utils";

interface SessionGridProps {
  children: React.ReactNode;
  isEmpty?: boolean;
  count?: number;
}

export function SessionGrid({ children, isEmpty }: SessionGridProps) {
  if (isEmpty) {
    return null; // Handle in parent with EmptyState
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {children}
    </div>
  );
}
