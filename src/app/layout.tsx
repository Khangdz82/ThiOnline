import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ThiOnline - Nền tảng Thi & Đánh giá Trực tuyến (0% Quảng cáo, Mã nguồn mở)",
  description: "Hệ thống tạo đề thi, quản lý lớp học, phòng thi chống gian lận và chấm bài tự động. 100% miễn phí.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
