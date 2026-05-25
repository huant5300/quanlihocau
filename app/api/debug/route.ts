import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET ? "SET (" + process.env.AUTH_SECRET.length + " chars)" : "MISSING",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
      AUTH_URL: process.env.AUTH_URL || "NOT SET",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET (" + process.env.GOOGLE_CLIENT_ID.substring(0, 20) + "...)" : "MISSING",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "MISSING",
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}
