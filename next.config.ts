import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.1.89",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Cho phép HMR hoạt động ổn định trên mạng LAN
  allowedDevOrigins: ["*", "localhost", "localhost:3000", "local-origin.dev", "*.local-origin.dev"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.vercel.app", "localhost:3000"],
    },
  },
  // Đảm bảo không bỏ qua lỗi để code luôn sạch
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
