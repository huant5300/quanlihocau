import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quản lý Hồ câu | Quản lý Hồ câu Cá chuyên nghiệp",
  description: "Giải pháp quản lý hồ câu toàn diện cho chủ hồ ",
};

import AppProviders from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className="light">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
