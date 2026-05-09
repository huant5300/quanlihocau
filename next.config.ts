import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Next.js 16 tối ưu hóa bundling, chúng ta bật các tính năng production-ready
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // Các tính năng tối ưu cho Next.js 16 nếu cần
  },
  // Đảm bảo không bỏ qua lỗi để code luôn sạch
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
