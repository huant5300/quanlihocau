import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fishing Lake SaaS | Quản lý Hồ câu Cá chuyên nghiệp",
  description: "Giải pháp quản lý hồ câu toàn diện cho chủ hồ và ngư dân.",
};

import { PWARegistration } from "@/components/shared/pwa-registration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <PWARegistration />
        </Providers>
      </body>
    </html>
  );
}
