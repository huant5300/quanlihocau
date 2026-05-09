"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-card/30 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl shadow-2xl relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
          <AlertCircle size={40} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Lỗi xác thực</h1>
        <p className="text-muted-foreground mb-6">
          {errorDescription || error || "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại."}
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full h-12 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
          >
            <RefreshCw size={18} />
            Thử lại
          </Link>
          
          <Link
            href="/"
            className="w-full h-12 bg-white/5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
          >
            <ArrowLeft size={18} />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground">
            Nếu lỗi vẫn tiếp diễn, vui lòng kiểm tra lại cấu hình Google OAuth trong Supabase Dashboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
