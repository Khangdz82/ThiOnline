"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const { stats, recentSubmissions, recentExams } = data || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bảng điều khiển Giảng dạy
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan hệ thống thi và đánh giá trực tuyến không quảng cáo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/classes"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Quản lý Lớp
          </Link>
          <Link
            href="/exams/create"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo đề thi mới</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Đề thi đã tạo</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalExams || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Lớp học</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalClasses || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Tổng Học sinh</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalStudents || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Lượt nộp bài</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalSubmissions || 0}
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Submissions + Recent Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bài nộp gần đây
            </h2>
            <span className="text-xs text-slate-500">
              {recentSubmissions?.length || 0} bài mới nhất
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-semibold text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="pb-3">Học sinh</th>
                  <th className="pb-3">Đề thi</th>
                  <th className="pb-3 text-center">Điểm</th>
                  <th className="pb-3 text-center">Trạng thái</th>
                  <th className="pb-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSubmissions && recentSubmissions.length > 0 ? (
                  recentSubmissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-900 dark:text-white">{sub.student_name}</p>
                        <p className="text-xs text-slate-400">{sub.student_code || "SBD"} • {sub.class_name || "Tự do"}</p>
                      </td>
                      <td className="py-3.5 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {sub.exam_title}
                      </td>
                      <td className="py-3.5 text-center font-bold text-emerald-600">
                        {sub.score}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            sub.status === "graded"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {sub.status === "graded" ? "Đã chấm" : "Chờ chấm"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/grade/${sub.id}`}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          Chấm bài
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                      Chưa có lượt nộp bài nào. Học sinh khi làm bài xong sẽ hiện tại đây.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Exams List (1 Col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Đề thi đang mở
            </h2>
            <Link href="/exams" className="text-xs font-semibold text-emerald-600 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentExams && recentExams.length > 0 ? (
              recentExams.map((ex: any) => (
                <div
                  key={ex.id}
                  className="rounded-xl border border-slate-100 p-3.5 hover:border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <Link href={`/exams/${ex.id}`} className="block">
                    <h3 className="font-semibold text-slate-900 hover:text-emerald-600 dark:text-white text-sm line-clamp-1">
                      {ex.title}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{ex.question_count} câu • {ex.duration} phút</span>
                    <span className="font-medium text-emerald-600">{ex.submission_count} bài nộp</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Chưa có đề thi nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
