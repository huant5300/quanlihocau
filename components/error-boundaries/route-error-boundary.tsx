"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RouteErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  backHref?: string;
}

export function RouteErrorBoundary({
  error,
  reset,
  title = "Không thể tải dữ liệu trang này",
  description = "Đã xảy ra sự cố khi kết nối hoặc xử lý dữ liệu. Vui lòng thử lại hoặc tải lại trang.",
  backHref = "/dashboard",
}: RouteErrorBoundaryProps) {
  useEffect(() => {
    console.error("[Route Error Boundary Captured]:", error);
  }, [error]);

  return (
    <div className="p-6 md:p-12 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle size={32} strokeWidth={2.2} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl text-[11px] font-mono text-slate-500 dark:text-zinc-400 break-all text-left border border-slate-200/50 dark:border-zinc-700/50">
            Chi tiết: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="h-11 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <RotateCcw size={15} /> Thử lại
          </Button>

          <Link href={backHref} className="w-full">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-bold text-xs border border-slate-200 dark:border-zinc-700 gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={15} /> Quay lại
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
