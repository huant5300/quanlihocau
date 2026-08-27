import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  interval: number; // in milliseconds
  max: number; // max requests per interval
}

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// In-memory sliding-window tracker (per serverless instance / warm container)
const rateLimitMap = new Map<string, RateLimitStore>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit for a given key (IP address or user ID)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { interval: 60 * 1000, max: 60 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitStore = {
      count: 1,
      resetAt: now + config.interval,
    };
    rateLimitMap.set(key, newRecord);
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: newRecord.resetAt,
    };
  }

  if (record.count < config.max) {
    record.count += 1;
    return {
      success: true,
      limit: config.max,
      remaining: config.max - record.count,
      reset: record.resetAt,
    };
  }

  return {
    success: false,
    limit: config.max,
    remaining: 0,
    reset: record.resetAt,
  };
}

/**
 * Extract client IP from Next.js request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Middleware helper for Next.js Route Handlers
 */
export function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig = { interval: 60 * 1000, max: 60 }
): NextResponse | null {
  const ip = getClientIp(req);
  const path = req.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const result = checkRateLimit(key, config);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau giây lát.",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return null;
}
