"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full glass-card p-12 rounded-[3rem] text-center space-y-8 shadow-2xl border-2 border-destructive/20">
        <div className="w-24 h-24 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center text-destructive mx-auto">
          <AlertCircle size={48} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight">Đã có lỗi xảy ra</h1>
          <p className="text-muted-foreground font-medium">
            Chúng tôi xin lỗi vì sự bất tiện này. Ứng dụng đã gặp một lỗi không mong muốn.
          </p>
        </div>

        {error.message && (
          <div className="p-4 bg-muted/50 rounded-2xl text-[10px] font-mono text-left break-all opacity-70">
            Error: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button 
            onClick={() => reset()}
            className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs gap-3"
          >
            <RotateCcw size={20} /> Thử lại
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button 
              variant="outline"
              className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2"
            >
              <Home size={18} className="mr-2" /> Quay về Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
