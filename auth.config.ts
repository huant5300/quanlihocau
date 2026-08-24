import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";

const rawBaseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://quanlihocau.com");
export const baseUrl = rawBaseUrl.replace(/\/+$/, "");

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret_key_123456",
  trustHost: true,
  basePath: "/api/auth",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnboarding = nextUrl.pathname.startsWith("/onboarding");

      if (isDashboard || isOnboarding) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", baseUrl));
      }
      return true;
    },
  },
  providers: [], // Add empty providers to satisfy type
} satisfies NextAuthConfig;

export const { auth } = NextAuth(authConfig);
