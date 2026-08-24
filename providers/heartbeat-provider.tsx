"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const HeartbeatContext = createContext<null>(null);

export function HeartbeatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    // Track user interactions to determine activity
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Send heartbeat every 30 seconds if active and tab is visible
    const interval = setInterval(async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // If user has interacted with the page in the last 45 seconds
      if (timeSinceLastActivity < 45000) {
        try {
          await fetch("/api/v1/user/heartbeat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ seconds: 30 }),
          }).catch(() => {
            // Silently ignore transient network drops for background heartbeat
          });
        } catch {
          // Ignore
        }
      }
    }, 30000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [session, status]);

  return (
    <HeartbeatContext.Provider value={null}>
      {children}
    </HeartbeatContext.Provider>
  );
}

export const useHeartbeat = () => useContext(HeartbeatContext);
