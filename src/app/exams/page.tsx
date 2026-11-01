"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";

export default function ExamsListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      const json = await res.json();
      if (json.success) {
        setExams(json.exams || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (examId: string) => {
    const url = `${window.location.origin}/test/${examId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này? Dữ liệu bài làm sẽ bị xóa theo.")) return;
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setExams((prev) => prev.filter((e) => e.id !== examId));
      }
    } catch (e) {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Danh sách Đề thi & Bài tập
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý các đề kiểm tra online, sao chép link phòng thi gửi cho học sinh.
          </p>
        </div>

        <Link
          href="/exams/create"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tạo đề mới</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Chưa có đề thi nào</h3>
          <p className="mt-1 text-sm text-slate-500">Tạo đề thi từ file Word hoặc soạn câu hỏi ngay.</p>
          <Link
            href="/exams/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Tạo đề đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {ex.exam_type === "test" ? "Bài kiểm tra" : "Bài tập về nhà"}
                  </span>
                  <button
                    onClick={() => handleDeleteExam(ex.id)}
                    title="Xóa đề thi"
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Link href={`/exams/${ex.id}`} className="mt-3 block group">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white line-clamp-2">
                    {ex.title}
                  </h3>
                </Link>

                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                  {ex.description || "Không có mô tả thêm."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    {ex.duration} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    {ex.question_count} câu
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                    {ex.submission_count} bài nộp
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800 gap-2">
                <button
                  onClick={() => handleCopyLink(ex.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copiedId === ex.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Đã copy link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy link thi</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/test/${ex.id}`}
                    target="_blank"
                    title="Vào phòng thi (Giao diện học sinh)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 text-slate-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/exams/${ex.id}`}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Phổ điểm</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
