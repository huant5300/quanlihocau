"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl shadow-primary/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
            Đang xác thực bảo mật...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
