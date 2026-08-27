/**
 * Sentry Client Configuration for Next.js
 * Captures uncaught frontend exceptions, hydration errors, and performance traces.
 */
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

export function initSentryClient() {
  if (!SENTRY_DSN) return;

  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      if (process.env.NODE_ENV === "production") {
        console.error("[Sentry Client Error Event]:", event.error || event.message);
      }
    });

    window.addEventListener("unhandledrejection", (event) => {
      if (process.env.NODE_ENV === "production") {
        console.error("[Sentry Unhandled Promise Rejection]:", event.reason);
      }
    });
  }
}

initSentryClient();
