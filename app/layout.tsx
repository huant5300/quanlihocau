import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "./providers";
import { PWARegistration } from "@/components/shared/pwa-registration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quản lý Hồ câu | Quản lý Hồ câu Cá chuyên nghiệp",
  description: "Giải pháp quản lý hồ câu toàn diện cho chủ hồ ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quản lý Hồ câu",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className="light">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AppProviders>
          <PWARegistration />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
