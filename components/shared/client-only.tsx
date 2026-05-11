"use client";

import { useEffect, useState } from "react";

/**
 * Hydration guard component to ensure children are only rendered on the client.
 * Use this to wrap components that use browser-only APIs or have unstable
 * initial state that differs from SSR.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
