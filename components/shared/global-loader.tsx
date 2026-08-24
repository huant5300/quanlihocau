"use client";

import { useIsMutating, useIsFetching } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalLoader() {
  const isMutating = useIsMutating();
  const [show, setShow] = useState(false);
  const [loadingText, setLoadingText] = useState("Đang xử lý...");

  // Global custom event listener for manual triggers
  useEffect(() => {
    const handleGlobalLoadStart = (e: any) => {
      setLoadingText(e.detail?.text || "Đang xử lý...");
      setShow(true);
    };
    const handleGlobalLoadStop = () => {
      setShow(false);
    };

    window.addEventListener("show-global-loader", handleGlobalLoadStart);
    window.addEventListener("hide-global-loader", handleGlobalLoadStop);

    return () => {
      window.removeEventListener("show-global-loader", handleGlobalLoadStart);
      window.removeEventListener("hide-global-loader", handleGlobalLoadStop);
    };
  }, []);

  // React Query mutation listener
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMutating > 0) {
      setLoadingText("Đang lưu dữ liệu...");
      // Show loader immediately if mutating
      setShow(true);
    } else {
      // Small delay to prevent flickering if multiple mutations happen sequentially
      timer = setTimeout(() => {
        setShow(false);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [isMutating]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-emerald-500/20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              <div className="relative bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/30">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            </div>
            
            <div className="space-y-1 text-center">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {loadingText}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vui lòng không đóng trang web
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to manually show/hide from anywhere
export const globalLoader = {
  show: (text?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show-global-loader", { detail: { text } }));
    }
  },
  hide: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hide-global-loader"));
    }
  }
};
