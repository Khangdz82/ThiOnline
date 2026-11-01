"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [examCode, setExamCode] = useState("");

  const handleJoinExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examCode.trim()) return;
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
            <span>Mã nguồn mở 100% • Hoàn toàn không quảng cáo</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Nền tảng Kiểm tra & Đánh giá <br className="hidden sm:inline" />
            <span className="text-emerald-600 dark:text-emerald-400">Thuần khiết & Hiệu năng cao</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            Đầy đủ tính năng như Azota: Tự động tách đề Word/LaTeX, phòng thi Focus chống gian lận,
            chấm tự luận vẽ trực tiếp lên ảnh bài làm, thống kê phổ điểm chuẩn Bộ GD&ĐT.
          </p>

          {/* Quick Exam Entry Card for Students */}
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleJoinExam} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="Nhập mã đề hoặc dán link thi..."
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <span>Vào thi</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-slate-400">
              Thử nhanh đề mẫu:{" "}
              <Link
                href="/test/exam-demo-toan-12"
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                exam-demo-toan-12
              </Link>
            </p>
          </div>

          {/* Teacher quick link */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900"
            >
              <span>Vào bảng điều khiển Giáo viên</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/exams/create"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>+ Soạn đề nhanh</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              0% Quảng Cáo
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Loại bỏ hoàn toàn các banner, popup quảng cáo làm phiền khi học sinh làm bài hoặc giáo viên chấm bài.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Parser Word & KaTeX
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tự động nhận diện cấu trúc đề thi từ file .docx và công thức Toán/Lý/Hóa LaTeX hiển thị sắc nét.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Chống Gian Lận Đa Tầng
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Chế độ toàn màn hình, bắt sự kiện chuyển tab, mất tiêu điểm, ghi nhật ký vi phạm thời gian thực.
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
              Canvas chấm tự luận: giáo viên tick đúng, gạch sai, vẽ ghi chú trực tiếp lên ảnh bài làm của học sinh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
