/**
 * Sentry Edge Configuration for Next.js Middleware and Edge routes
 */
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export function captureEdgeException(error: any) {
  if (SENTRY_DSN) {
    console.error("[Sentry Edge Captured]:", error?.message || error);
  }
}
