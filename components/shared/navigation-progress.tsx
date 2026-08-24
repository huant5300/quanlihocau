"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPill, setShowPill] = useState(false);

  // When pathname or searchParams change, navigation has completed!
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
        setShowPill(false);
        
        // Hide global loader
        if (typeof window !== "undefined") {
          const { globalLoader } = require("./global-loader");
          globalLoader.hide();
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Global click listener to intercept internal link clicks immediately
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, hash-only anchors, target="_blank", or download links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      // Check if navigating to the same URL
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (href === currentUrl) return;

      // Immediately start the progress bar on click!
      setIsNavigating(true);
      setProgress(35);
      
      // Also show global loader for better visibility
      if (typeof window !== "undefined") {
        const { globalLoader } = require("./global-loader");
        globalLoader.show("Đang tải dữ liệu...");
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, []);

  // Animate progress while navigating
  useEffect(() => {
    if (!isNavigating) return;

    // Show floating pill after 180ms if still navigating
    const pillTimer = setTimeout(() => {
      setShowPill(true);
    }, 180);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const remaining = 90 - prev;
        return prev + remaining * 0.15;
      });
    }, 120);

    return () => {
      clearInterval(interval);
      clearTimeout(pillTimer);
    };
  }, [isNavigating]);

  // Expose global helper to window for programmatic triggers
  useEffect(() => {
    (window as any).__startNavProgress = () => {
      setIsNavigating(true);
      setProgress(40);
    };
    (window as any).__doneNavProgress = () => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
        setShowPill(false);
      }, 200);
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <>
      {/* ── TOP GLOWING PROGRESS BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-[99999] h-[3.5px] pointer-events-none overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8),0_0_6px_rgba(6,182,212,0.6)] transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
            opacity: progress === 100 ? 0 : 1,
          }}
        />
      </div>

      {/* ── FLOATING MICRO-STATUS PILL (Smooth entrance if wait > 180ms) ── */}
      <AnimatePresence>
        {showPill && isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[99998] pointer-events-none"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white border border-emerald-500/30 shadow-2xl backdrop-blur-md">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-xs font-semibold tracking-wide text-emerald-300">
                Đang chuyển trang...
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
