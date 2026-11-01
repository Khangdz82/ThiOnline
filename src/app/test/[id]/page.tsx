"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { MathView } from "@/components/MathView";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Send,
  Maximize2,
  Minimize2,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
  HelpCircle,
  X,
} from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question_index: number;
  type: "single_choice" | "multiple_choice" | "true_false" | "short_answer" | "essay";
  content: string;
  options: Option[];
  score: number;
}

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  password?: string;
  anti_cheat_level: string;
}

export default function ExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  // Student Identification State
  const [hasStarted, setHasStarted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [className, setClassName] = useState("");
  const [examPassword, setExamPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Exam Data
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Answers State: { [questionId]: { chosen?: any, essay_text?: string, images?: string[] } }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  // Timer & Progress
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Anti-cheat State
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationMsg, setLastViolationMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const awayTimerRef = useRef<number | null>(null);

  // 1. Fetch Exam Data
  useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch(`/api/exams/${examId}?role=student`);
        const data = await res.json();
        if (data.success) {
          setExam(data.exam);
          setQuestions(data.questions || []);
          setTimeLeft((data.exam.duration || 45) * 60);
        } else {
          alert("Lỗi tải đề thi: " + data.error);
        }
      } catch (e) {
        console.error("Fetch exam error:", e);
      } finally {
        setLoading(false);
      }
    }
    if (examId) fetchExam();
  }, [examId]);

  // Load saved draft answers from localStorage
  useEffect(() => {
    if (!examId) return;
    try {
      const saved = localStorage.getItem(`exam_draft_${examId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.studentCode) setStudentCode(parsed.studentCode);
        if (parsed.className) setClassName(parsed.className);
      }
    } catch {}
  }, [examId]);

  // Auto-save to localStorage whenever answers change
  useEffect(() => {
    if (!hasStarted || !examId) return;
    try {
      localStorage.setItem(
        `exam_draft_${examId}`,
        JSON.stringify({ answers, studentName, studentCode, className })
      );
    } catch {}
  }, [answers, hasStarted, examId, studentName, studentCode, className]);

  // 2. Anti-cheat Monitors (Visibility change, Tab switch, Window blur)
  useEffect(() => {
    if (!hasStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        awayTimerRef.current = Date.now();
      } else {
        if (awayTimerRef.current) {
          const secondsAway = Math.round((Date.now() - awayTimerRef.current) / 1000);
          awayTimerRef.current = null;
          logViolation("tab_switch", secondsAway, `Rời màn hình thi ${secondsAway}s`);
        }
      }
    };

    const handleWindowBlur = () => {
      if (!document.hidden && !awayTimerRef.current) {
        awayTimerRef.current = Date.now();
      }
    };

    const handleWindowFocus = () => {
      if (awayTimerRef.current) {
        const secondsAway = Math.round((Date.now() - awayTimerRef.current) / 1000);
        awayTimerRef.current = null;
        logViolation("window_blur", secondsAway, `Mất tiêu điểm cửa sổ ${secondsAway}s`);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Bạn đang trong phòng thi! Dữ liệu bài làm có thể bị mất nếu thoát.";
      return e.returnValue;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasStarted, examId]);

  const logViolation = async (eventType: string, durationSeconds: number, details: string) => {
    setViolationCount((prev) => prev + 1);
    setLastViolationMsg(`Cảnh báo vi phạm: Bạn vừa rời màn hình thi (${details}). Hệ thống đã báo cáo giáo viên.`);

    try {
      await fetch(`/api/exams/${examId}/violations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          duration_away_seconds: durationSeconds,
          details: `${studentName || "Thí sinh"} - ${details}`,
        }),
      });
    } catch {}
  };

  // 3. Timer Countdown
  useEffect(() => {
    if (!hasStarted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, timeLeft]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Start Exam Handler
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("Vui lòng nhập Họ và tên!");
      return;
    }

    if (exam?.password && exam.password.trim() !== "") {
      if (examPassword !== exam.password) {
        setPasswordError("Mật khẩu đề thi không đúng!");
        return;
      }
    }

    setStartTime(Date.now());
    setHasStarted(true);

    // Prompt for full screen mode
    if (exam?.anti_cheat_level === "strict") {
      try {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } catch {}
    }
  };

  // Answer selection handlers
  const handleSelectChoice = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        chosen: optionId,
      },
    }));
  };

  const handleSelectTrueFalse = (questionId: string, subId: string, val: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.chosen || {};
      return {
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          chosen: {
            ...current,
            [subId]: val,
          },
        },
      };
    });
  };

  const handleShortAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        chosen: text,
      },
    }));
  };

  const handleEssayImageUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAnswers((prev) => {
          const currentImages = prev[questionId]?.images || [];
          return {
            ...prev,
            [questionId]: {
              ...(prev[questionId] || {}),
              images: [...currentImages, base64],
            },
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveEssayImage = (questionId: string, index: number) => {
    setAnswers((prev) => {
      const currentImages = [...(prev[questionId]?.images || [])];
      currentImages.splice(index, 1);
      return {
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          images: currentImages,
        },
      };
    });
  };

  const toggleBookmark = (questionId: string) => {
    setBookmarked((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Submit Exam
  const handleSubmitExam = async (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const durationSeconds = startTime > 0 ? Math.round((Date.now() - startTime) / 1000) : 0;

    try {
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          student_code: studentCode,
          class_name: className,
          answers,
          duration_seconds: durationSeconds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(`exam_draft_${examId}`);
        router.push(
          `/test/${examId}/result?subId=${data.submissionId}&score=${data.score}&auto=${isAuto ? 1 : 0}`
        );
      } else {
        alert("Nộp bài thất bại: " + data.error);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert("Lỗi kết nối khi nộp bài: " + err.message);
      setIsSubmitting(false);
    }
  };

  // Helper: check if question has been answered
  const isQuestionAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === "single_choice") return Boolean(ans.chosen);
    if (q.type === "short_answer") return Boolean(ans.chosen?.trim());
    if (q.type === "true_false") {
      return ans.chosen && Object.keys(ans.chosen).length === q.options.length;
    }
    if (q.type === "essay") {
      return Boolean(ans.essay_text?.trim() || (ans.images && ans.images.length > 0));
    }
    return false;
  };

  const totalAnswered = questions.filter(isQuestionAnswered).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-300">Đang chuẩn bị phòng thi an toàn...</p>
        </div>
      </div>
    );
  }

  // SCREEN 1: BÁO DANH / ĐĂNG NHẬP PHÒNG THI
  if (!hasStarted) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Phòng thi trực tuyến • 0 Quảng cáo
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {exam?.title || "Đề kiểm tra"}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Thời gian làm bài: <strong className="text-slate-800 dark:text-slate-200">{exam?.duration} phút</strong> •{" "}
              Số lượng: <strong className="text-slate-800 dark:text-slate-200">{questions.length} câu hỏi</strong>
            </p>
          </div>

          <form onSubmit={handleStartExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Số báo danh (SBD) / Mã HS
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="SBD001"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Lớp
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="12A1"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {exam?.password ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mật khẩu bài thi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={examPassword}
                  onChange={(e) => {
                    setExamPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Nhập mật khẩu do giáo viên cấp"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                {passwordError && (
                  <p className="mt-1 text-xs text-rose-500">{passwordError}</p>
                )}
              </div>
            ) : null}

            <div className="rounded-lg bg-amber-50 p-3.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <strong>Quy định phòng thi nghiêm túc:</strong> Hệ thống tự động ghi nhật ký khi chuyển tab, thu nhỏ hoặc rời khỏi cửa sổ làm bài. Hãy đảm bảo đường truyền mạng ổn định trước khi bắt đầu.
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Bắt đầu làm bài thi
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Format time remaining
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 300; // Under 5 minutes

  // SCREEN 2: ACTIVE EXAM ROOM (FOCUS MODE)
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-20">
      {/* Violation Alert Toast */}
      {lastViolationMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-lg dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <span>{lastViolationMsg}</span>
          <button
            onClick={() => setLastViolationMsg("")}
            className="ml-auto text-rose-600 hover:text-rose-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Floating Top Bar: Sticky Timer, Candidate Info, Anti-cheat status, Submit button */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left: Candidate info */}
          <div className="flex items-center gap-3 truncate">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {studentName} {studentCode ? `(${studentCode})` : ""}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {exam?.title} • {className || "Thí sinh"}
              </p>
            </div>
          </div>

          {/* Center: Timer */}
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-base sm:text-lg font-bold shadow-inner ${
              isTimeWarning
                ? "bg-rose-50 text-rose-700 animate-pulse border border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
            }`}
          >
            <Clock className={`h-5 w-5 ${isTimeWarning ? "text-rose-600" : "text-emerald-600"}`} />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {violationCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                {violationCount} lần rời tab
              </span>
            )}

            <button
              onClick={toggleFullscreen}
              title="Toàn màn hình"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Nộp bài ({totalAnswered}/{questions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination Layout: Questions Content + Sidebar Question Palette */}
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Question List (3 Cols) */}
          <div className="space-y-6 lg:col-span-3">
            {questions.map((q, idx) => {
              const isMarked = bookmarked[q.id];
              const ans = answers[q.id];

              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {q.type === "single_choice"
                          ? "Trắc nghiệm (1 đáp án)"
                          : q.type === "true_false"
                          ? "Đúng / Sai (GDPT 2018)"
                          : q.type === "essay"
                          ? "Tự luận"
                          : "Trả lời ngắn"}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {q.score} điểm
                      </span>
                    </div>

                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        isMarked
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isMarked ? "fill-amber-500 text-amber-500" : ""}`} />
                      <span>{isMarked ? "Đã đánh dấu" : "Đánh dấu"}</span>
                    </button>
                  </div>

                  {/* Question Content (Render with KaTeX) */}
                  <div className="mt-4 text-base font-normal leading-relaxed text-slate-900 dark:text-slate-100">
                    <MathView content={q.content} />
                  </div>

                  {/* Options Renderer */}
                  <div className="mt-6">
                    {/* TYPE 1: Single Choice (A, B, C, D) */}
                    {q.type === "single_choice" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt) => {
                          const isSelected = ans?.chosen === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectChoice(q.id, opt.id)}
                              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600 dark:bg-emerald-950/40"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  isSelected
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <div className="flex-1 text-sm text-slate-800 dark:text-slate-200">
                                <MathView content={opt.text} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TYPE 2: True/False GDPT 2018 (a, b, c, d) */}
                    {q.type === "true_false" && (
                      <div className="space-y-3">
                        {q.options.map((opt) => {
                          const chosenVal = ans?.chosen?.[opt.id];
                          return (
                            <div
                              key={opt.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  {opt.id.toLowerCase()})
                                </span>
                                <div className="text-sm text-slate-800 dark:text-slate-200">
                                  <MathView content={opt.text} />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectTrueFalse(q.id, opt.id, true)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    chosenVal === true
                                      ? "bg-emerald-600 text-white"
                                      : "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  Đúng
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectTrueFalse(q.id, opt.id, false)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    chosenVal === false
                                      ? "bg-rose-600 text-white"
                                      : "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  Sai
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* TYPE 3: Short Answer */}
                    {q.type === "short_answer" && (
                      <div>
                        <input
                          type="text"
                          value={ans?.chosen || ""}
                          onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                          placeholder="Nhập câu trả lời ngắn của bạn (số hoặc chữ)..."
                          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    )}

                    {/* TYPE 4: Essay (Text + Photo Upload) */}
                    {q.type === "essay" && (
                      <div className="space-y-4">
                        <textarea
                          rows={4}
                          value={ans?.essay_text || ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: { ...(prev[q.id] || {}), essay_text: e.target.value },
                            }))
                          }
                          placeholder="Nhập lời giải tự luận hoặc tải ảnh bài làm bên dưới..."
                          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />

                        {/* Image upload area */}
                        <div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <Upload className="h-4 w-4 text-emerald-600" />
                            <span>Chụp ảnh / Đính kèm ảnh bài làm</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => handleEssayImageUpload(q.id, e)}
                            />
                          </label>

                          {/* Preview uploaded images */}
                          {ans?.images && ans.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {ans.images.map((img: string, iIdx: number) => (
                                <div key={iIdx} className="group relative rounded-lg border border-slate-200 overflow-hidden">
                                  <img
                                    src={img}
                                    alt={`Bài làm trang ${iIdx + 1}`}
                                    className="h-28 w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEssayImage(q.id, iIdx)}
                                    className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white opacity-90 hover:opacity-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                                    Ảnh {iIdx + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Question Palette (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Mục lục câu hỏi</span>
                <span className="text-xs font-medium text-emerald-600">
                  {totalAnswered}/{questions.length} đã làm
                </span>
              </h3>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(totalAnswered / (questions.length || 1)) * 100}%` }}
                />
              </div>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-500 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-600" />
                  <span>Đã làm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span>Đánh dấu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span>Chưa làm</span>
                </div>
              </div>

              {/* Number Grid */}
              <div className="mt-4 grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isDone = isQuestionAnswered(q);
                  const isMarked = bookmarked[q.id];

                  let btnStyle =
                    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300";
                  if (isMarked) {
                    btnStyle = "bg-amber-400 text-amber-950 font-bold ring-2 ring-amber-300";
                  } else if (isDone) {
                    btnStyle = "bg-emerald-600 text-white font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        const el = document.getElementById(`q-${q.id}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className={`flex h-9 w-full items-center justify-center rounded-lg text-xs transition-transform active:scale-95 ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Nộp bài thi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Xác nhận nộp bài thi
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Bạn đã hoàn thành <strong className="text-emerald-600 font-bold">{totalAnswered}/{questions.length}</strong> câu hỏi.
              {totalAnswered < questions.length && (
                <span className="block mt-1 text-rose-500 font-medium">
                  Cảnh báo: Vẫn còn {questions.length - totalAnswered} câu chưa trả lời!
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitExam(false)}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? "Đang nộp bài..." : "Xác nhận nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
