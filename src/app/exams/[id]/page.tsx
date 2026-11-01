"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MathView } from "@/components/MathView";
import { useToast } from "@/components/Toast";
import * as XLSX from "xlsx";
import {
  FileText,
  Copy,
  Check,
  Download,
  Users,
  Clock,
  Award,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function ExamDetailPage() {
  const params = useParams();
  const toast = useToast();
  const examId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"submissions" | "questions" | "analytics">("submissions");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/exams/${examId}?role=teacher`);
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
    if (examId) fetchDetail();
  }, [examId]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/test/${examId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Đã copy link phòng thi vào clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Export submissions to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!data?.submissions || data.submissions.length === 0) {
      toast.warning("Chưa có học sinh nào nộp bài để xuất bảng điểm.");
      return;
    }

    const rows = data.submissions.map((sub: any, idx: number) => ({
      STT: idx + 1,
      "Họ và tên": sub.student_name,
      SBD: sub.student_code || "",
      Lớp: sub.class_name || "",
      "Điểm số": sub.score,
      "Thời gian làm (giây)": sub.duration_seconds || 0,
      "Số lần vi phạm": sub.violation_count || 0,
      "Trạng thái": sub.status === "graded" ? "Đã chấm" : "Chờ chấm",
      "Thời điểm nộp": sub.submitted_at || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BangDiem");

    const fileName = `Bang_Diem_${data.exam.title.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.exam) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy đề thi</h2>
        <Link href="/exams" className="mt-4 inline-block text-emerald-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const { exam, questions, submissions } = data;

  // Analytics calculation
  const totalSubmissions = submissions.length;
  const scores = submissions.map((s: any) => s.score);
  const avgScore = totalSubmissions > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / totalSubmissions).toFixed(1) : "0";
  const maxScore = totalSubmissions > 0 ? Math.max(...scores) : 0;
  const minScore = totalSubmissions > 0 ? Math.min(...scores) : 0;

  // Histogram buckets: < 5 (Kém/Yếu), 5 - 6.5 (Trung bình), 6.5 - 8 (Khá), 8 - 10 (Giỏi)
  const buckets = {
    weak: scores.filter((s: number) => s < 5).length,
    average: scores.filter((s: number) => s >= 5 && s < 6.5).length,
    good: scores.filter((s: number) => s >= 6.5 && s < 8).length,
    excellent: scores.filter((s: number) => s >= 8).length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại danh sách đề thi</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {exam.title}
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              {exam.description || "Đề thi trực tuyến không quảng cáo."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">Đã copy link</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy link cho học sinh</span>
                </>
              )}
            </button>

            <Link
              href={`/test/${exam.id}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Thử làm bài</span>
            </Link>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Xuất Excel Bảng điểm</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Số bài nộp</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalSubmissions}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Điểm trung bình</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{avgScore} / 10</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Điểm cao nhất</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{maxScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Thời lượng</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{exam.duration} phút</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "submissions"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Danh sách nộp bài ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Phổ điểm & Thống kê
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "questions"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Đề bài & Đáp án ({questions.length} câu)
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS TABLE */}
      {activeTab === "submissions" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800/50 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Họ và tên thí sinh</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-center">Thời gian làm</th>
                  <th className="py-3 px-4 text-center">Giám sát vi phạm</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.length > 0 ? (
                  submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {sub.student_name}
                        {sub.student_code && (
                          <span className="block text-xs font-normal text-slate-400">
                            SBD: {sub.student_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {sub.class_name || "Tự do"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 text-base">
                        {sub.score}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 text-xs">
                        {Math.floor((sub.duration_seconds || 0) / 60)}p {(sub.duration_seconds || 0) % 60}s
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sub.violation_count > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            <AlertTriangle className="h-3 w-3" />
                            {sub.violation_count} lần rời tab
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Trung thực 100%</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sub.status === "graded"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {sub.status === "graded" ? "Đã chấm" : "Chờ chấm tự luận"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/grade/${sub.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                        >
                          <span>Chấm bài</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                      Chưa có học sinh nào nộp bài. Hãy gửi link làm bài cho học sinh.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCORE HISTOGRAM & ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">
              Phổ điểm Đánh giá Năng lực
            </h3>

            {totalSubmissions > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Giỏi (8.0 - 10.0 điểm)</span>
                    <span className="text-emerald-600">{buckets.excellent} học sinh ({((buckets.excellent / totalSubmissions) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div className="h-full bg-emerald-500" style={{ width: `${(buckets.excellent / totalSubmissions) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Khá (6.5 - 7.9 điểm)</span>
                    <span className="text-blue-600">{buckets.good} học sinh ({((buckets.good / totalSubmissions) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div className="h-full bg-blue-500" style={{ width: `${(buckets.good / totalSubmissions) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Trung bình (5.0 - 6.4 điểm)</span>
                    <span className="text-amber-600">{buckets.average} học sinh ({((buckets.average / totalSubmissions) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div className="h-full bg-amber-500" style={{ width: `${(buckets.average / totalSubmissions) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Dưới trung bình (&lt; 5.0 điểm)</span>
                    <span className="text-rose-600">{buckets.weak} học sinh ({((buckets.weak / totalSubmissions) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div className="h-full bg-rose-500" style={{ width: `${(buckets.weak / totalSubmissions) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">Cần ít nhất 1 bài nộp để hiển thị biểu đồ phổ điểm.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUESTIONS & ANSWERS */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {questions.map((q: any, idx: number) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2 mb-3 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">
                  Câu {idx + 1} ({q.type}) • {q.score} điểm
                </span>
                <span className="font-semibold text-emerald-600">
                  Đáp án đúng: {q.correct_answer || "Tự luận"}
                </span>
              </div>

              <div className="text-sm text-slate-800 dark:text-slate-200">
                <MathView content={q.content} />
              </div>

              {q.options && q.options.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`rounded-lg border p-2 flex items-start gap-1.5 ${
                        opt.id === q.correct_answer
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-950/40"
                          : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-bold">{opt.id}.</span>
                      <div className="flex-1">
                        <MathView content={opt.text} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {q.explanation && (
                <div className="mt-3 rounded-xl bg-amber-50/60 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  <strong>Lời giải: </strong>
                  <MathView content={q.explanation} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
