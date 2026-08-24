import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";

const rawBaseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://quanlihocau.com");
export const baseUrl = rawBaseUrl.replace(/\/+$/, "");

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "quanlihocau_secret_key_2026_safe",
  trustHost: true,
  basePath: "/api/auth",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnboarding = nextUrl.pathname.startsWith("/onboarding");

      // Logged-in users are always allowed on /dashboard and /onboarding regardless of lakeId
      if (isDashboard || isOnboarding) {
        return isLoggedIn;
      }
      // Redirect already logged-in users away from /login to /dashboard
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", baseUrl));
      }
      return true;
    },
  },
  providers: [], // Add empty providers to satisfy type
} satisfies NextAuthConfig;

export const { auth } = NextAuth(authConfig);
