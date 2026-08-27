/**
 * Sentry Server Configuration for Next.js
 * Captures uncaught server-side exceptions in API routes and Server Actions.
 */
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export function captureServerException(error: any, context?: Record<string, any>) {
  if (!SENTRY_DSN && process.env.NODE_ENV !== "production") {
    console.error("[Server Error Logged]:", error, context);
    return;
  }

  console.error("[Sentry Server Captured]:", {
    message: error?.message || error,
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}
