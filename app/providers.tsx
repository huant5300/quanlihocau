"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster 
          richColors 
          position="top-center" 
          toastOptions={{
            className: "notification-contrast scale-90 sm:scale-100",
            style: {
              borderRadius: "99px",
            }
          }} 
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
