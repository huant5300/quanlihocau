import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "./providers";
import { PWARegistration } from "@/components/shared/pwa-registration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Phần Mềm Quản Lý Hồ Câu Cá Chuyên Nghiệp | QuanLiHoCau™",
    template: "%s | QuanLiHoCau™"
  },
  description: "Giải pháp số hóa hồ câu cá dịch vụ toàn diện tại Việt Nam. Quản lý ca câu realtime, tự động tính tiền giờ, in hóa đơn bluetooth cầm tay và chống thất thoát 100%.",
  manifest: "/manifest.json",
  keywords: [
    "quản lý hồ câu cá",
    "phần mềm quản lý hồ câu",
    "phần mềm hồ câu dịch vụ",
    "in bill bluetooth pt-210",
    "tự động hóa hồ câu",
    "phần mềm saas hồ câu",
    "chuyển đổi số hồ câu"
  ],
  authors: [{ name: "Đội ngũ QuanLiHoCau" }],
  creator: "Đội ngũ QuanLiHoCau",
  publisher: "Đội ngũ QuanLiHoCau",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Phần Mềm Quản Lý Hồ Câu Cá Chuyên Nghiệp | QuanLiHoCau™",
    description: "Giải pháp số hóa hồ câu cá dịch vụ toàn diện tại Việt Nam. Quản lý ca câu realtime, tự động tính tiền giờ, in hóa đơn bluetooth cầm tay và chống thất thoát 100%.",
    url: "https://quanlihocau.com",
    siteName: "QuanLiHoCau",
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://quanlihocau.com",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QuanLiHoCau",
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
