"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  Zap,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Code2,
  GraduationCap,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [examCode, setExamCode] = useState("");

  const handleJoinExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examCode.trim()) {
      toast.warning("Vui lòng nhập mã đề thi hoặc dán link!");
      return;
    }
    const cleanId = examCode.trim().replace(/^.*\/test\//, "");
    router.push(`/test/${cleanId}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Nền tảng Mở 100% • 0% Quảng Cáo • Chuẩn GDPT 2018</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Nền tảng Thi & Đánh giá Trực tuyến <br className="hidden sm:inline" />
            <span className="text-emerald-600 dark:text-emerald-400">ThiOnline</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            Tối ưu tuyệt đối trải nghiệm: Học sinh vào làm bài nhanh không cần tạo tài khoản rườm rà.
            Giáo viên bóc tách đề Word/LaTeX tự động, phòng thi Focus chống chuyển tab, chấm tự luận trực tiếp trên ảnh bài làm.
          </p>

          {/* Quick Exam Entry Card for Students */}
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleJoinExam} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="Nhập mã đề hoặc dán link thi..."
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors shrink-0"
              >
                <span>Vào thi</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Đề thi thử nghiệm:{" "}
              <button
                type="button"
                onClick={() => router.push("/test/exam-demo-toan-12")}
                className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                exam-demo-toan-12
              </button>
            </p>
          </div>

          {/* Actor Quick Links: Teacher vs Student */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Bảng điều khiển Giáo viên</span>
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>Đăng nhập / Đăng ký</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              0% Quảng Cáo
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Trang web sạch sẽ, tuyệt đối không có banner hay popup quảng cáo làm phiền bài thi của học sinh.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Tách Đề Word Thông Minh
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Nhận diện tự động câu hỏi, phương án A/B/C/D, bảng đáp án, công thức Toán LaTeX hiển thị sắc nét bằng KaTeX.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Chống Gian Lận Nâng Cao
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Bắt chuyển tab, khóa copy/paste, khóa chuột phải, toàn màn hình, đếm số giây rời khỏi màn hình thi.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Chấm Ảnh Trực Quan
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Giáo viên tick đúng, gạch sai, vẽ ghi chú trực tiếp lên ảnh chụp bài làm tự luận của học sinh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
