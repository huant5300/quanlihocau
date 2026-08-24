"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { NavigationProgress } from "@/components/shared/navigation-progress";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationProgress />
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: "scale-90 sm:scale-100",
            }} 
          />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
