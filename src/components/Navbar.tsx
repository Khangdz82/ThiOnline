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
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm font-black text-lg shrink-0">
              T
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ThiOnline
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-300 dark:text-slate-700">|</span>
              <span className="hidden sm:inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Hệ thống Thi Trực Tuyến
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/exams/create"
            className="btn btn-primary px-3.5 py-2 text-sm whitespace-nowrap shrink-0"
          >
            + Tạo đề mới
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800 shrink-0">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline whitespace-nowrap">
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="btn btn-secondary px-3.5 py-2 text-sm whitespace-nowrap shrink-0"
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
