"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { MathView } from "@/components/MathView";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Award,
  HelpCircle,
} from "lucide-react";

export default function ExamResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params?.id as string;
  const subId = searchParams.get("subId");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!subId) return;
      try {
        const res = await fetch(`/api/submissions/${subId}`);
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
    loadResult();
  }, [subId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.submission) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy kết quả</h2>
        <Link href="/" className="mt-4 inline-block text-emerald-600 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const { submission, exam, questions, violations } = data;
  const isGraded = submission.status === "graded";
  const studentAnswers = submission.answers || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Nộp bài thành công
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {exam?.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Thí sinh: <strong className="text-slate-800 dark:text-slate-200">{submission.student_name}</strong>{" "}
              {submission.student_code ? `(${submission.student_code})` : ""} • Lớp: {submission.class_name || "Tự do"}
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isGraded ? "Điểm số đạt được" : "Điểm trắc nghiệm tạm tính"}
            </span>
            <div className="mt-1 flex items-baseline gap-1 font-mono text-4xl font-black text-emerald-600 dark:text-emerald-400">
              <span>{submission.score}</span>
              <span className="text-lg text-slate-400">/ 10</span>
            </div>
            {!isGraded && (
              <span className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                (Đang chờ GV chấm phần tự luận)
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Thời gian làm</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {Math.floor((submission.duration_seconds || 0) / 60)} phút {(submission.duration_seconds || 0) % 60}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <AlertTriangle className={`h-5 w-5 ${violations.length > 0 ? "text-rose-600" : "text-emerald-600"}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Chống gian lận</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {violations.length > 0 ? `${violations.length} lần rời tab` : "Trung thực 100%"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Trạng thái</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {isGraded ? "Đã chấm xong" : "Chờ hoàn tất"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher feedback if present */}
      {submission.teacher_feedback && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">Nhận xét của Giáo viên:</h3>
          <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">{submission.teacher_feedback}</p>
        </div>
      )}

      {/* Detailed Answers & Explanations (If allowed) */}
      {exam?.allow_view_answers ? (
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Chi tiết bài thi & Đáp án
          </h2>

          {questions.map((q: any, idx: number) => {
            const studentAns = studentAnswers[q.id];
            const isSingle = q.type === "single_choice";
            const isCorrect = isSingle && studentAns?.chosen?.toUpperCase() === q.correct_answer?.toUpperCase();

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      {q.type}
                    </span>
                  </div>

                  {isSingle && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đúng (+{q.score}đ)
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" /> Sai (0đ)
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <MathView content={q.content} />
                </div>

                {/* Show Choices */}
                {isSingle && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt: any) => {
                      const isStudentPick = studentAns?.chosen === opt.id;
                      const isRealAnswer = q.correct_answer === opt.id;

                      let style = "border-slate-200 dark:border-slate-800";
                      if (isRealAnswer) {
                        style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium";
                      } else if (isStudentPick && !isRealAnswer) {
                        style = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200";
                      }

                      return (
                        <div key={opt.id} className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${style}`}>
                          <span className="font-bold">{opt.id}.</span>
                          <div className="flex-1">
                            <MathView content={opt.text} />
                          </div>
                          {isRealAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                          {isStudentPick && !isRealAnswer && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Essay answers submitted */}
                {q.type === "essay" && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-semibold text-slate-500">Bài làm tự luận của thí sinh:</p>
                    {studentAns?.essay_text && (
                      <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{studentAns.essay_text}</p>
                    )}
                    {studentAns?.images && studentAns.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {studentAns.images.map((img: string, iIdx: number) => (
                          <img
                            key={iIdx}
                            src={img}
                            alt="Ảnh bài làm"
                            className="h-24 w-24 rounded-lg object-cover border border-slate-300"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                    <strong className="font-semibold block mb-1">Lời giải chi tiết:</strong>
                    <MathView content={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Giáo viên chưa cho phép xem lại chi tiết đáp án của đề thi này.
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
