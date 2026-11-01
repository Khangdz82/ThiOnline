"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  CheckCircle2,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  LogIn,
  User,
  LogOut,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check localStorage for logged-in user
    try {
      const stored = localStorage.getItem("thionline_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("thionline_user");
    setCurrentUser(null);
    window.location.href = "/";
  };

  // If in active test room /test/[id], hide navbar for total exam focus (anti-cheat & full concentration)
  if (pathname.startsWith("/test/") && !pathname.endsWith("/result")) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/exams", label: "Đề thi & Bài tập", icon: FileText },
    { href: "/classes", label: "Lớp học & Học sinh", icon: Users },
    { href: "/question-bank", label: "Ngân hàng câu hỏi", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm font-black text-lg">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ThiOnline
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                0% Quảng cáo • Mã nguồn mở
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Phòng thi Focus</span>
          </div>

          <Link
            href="/exams/create"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
          >
            + Tạo đề mới
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Giáo viên Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
