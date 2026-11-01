"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MathView } from "@/components/MathView";
import { useToast } from "@/components/Toast";
import {
  Check,
  X,
  PenTool,
  RotateCcw,
  Save,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface Annotation {
  type: "tick" | "cross" | "pen" | "score";
  x: number;
  y: number;
  text?: string;
  points?: { x: number; y: number }[];
  color?: string;
}

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const subId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "canvas">("questions");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Grading form state
  const [questionScores, setQuestionScores] = useState<Record<string, number>>({});
  const [questionComments, setQuestionComments] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<"tick" | "cross" | "pen">("tick");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Fetch submission data
  useEffect(() => {
    async function fetchSub() {
      try {
        const res = await fetch(`/api/submissions/${subId}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
          setFeedback(json.submission.teacher_feedback || "");
          if (json.submission.essay_annotations) {
            setAnnotations(json.submission.essay_annotations);
          }

          // Initialize question scores from submission answers or calculate
          const scoresInit: Record<string, number> = {};
          const commentsInit: Record<string, string> = {};
          const answers = json.submission.answers || {};

          json.questions.forEach((q: any) => {
            const studentAns = answers[q.id];
            if (studentAns?.teacher_score !== undefined) {
              scoresInit[q.id] = Number(studentAns.teacher_score);
            } else if (q.type === "single_choice") {
              const isCorrect = studentAns?.chosen?.toUpperCase() === q.correct_answer?.toUpperCase();
              scoresInit[q.id] = isCorrect ? Number(q.score) : 0;
            } else if (q.type === "short_answer") {
              const isCorrect = studentAns?.chosen?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase();
              scoresInit[q.id] = isCorrect ? Number(q.score) : 0;
            } else if (q.type === "essay") {
              scoresInit[q.id] = studentAns?.teacher_score || 0;
            }
            if (studentAns?.teacher_comment) {
              commentsInit[q.id] = studentAns.teacher_comment;
            }
          });

          setQuestionScores(scoresInit);
          setQuestionComments(commentsInit);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (subId) fetchSub();
  }, [subId]);

  // Extract all essay images across questions
  const essayImages: { qId: string; qIndex: number; src: string }[] = [];
  if (data?.submission?.answers && data?.questions) {
    const answers = data.submission.answers;
    data.questions.forEach((q: any) => {
      const ans = answers[q.id];
      if (ans?.images && Array.isArray(ans.images)) {
        ans.images.forEach((imgSrc: string) => {
          essayImages.push({ qId: q.id, qIndex: q.question_index, src: imgSrc });
        });
      }
    });
  }

  // Calculate live total score
  const totalScore = Object.values(questionScores).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const roundedTotal = Math.min(10, Math.round(totalScore * 100) / 100);

  // Draw background image and annotations onto canvas
  useEffect(() => {
    if (activeTab !== "canvas") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImg = essayImages[activeImageIndex]?.src;
    if (currentImg) {
      const img = new Image();
      img.src = currentImg;
      img.onload = () => {
        canvas.width = img.width > 1200 ? 1200 : img.width;
        const scale = canvas.width / img.width;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        renderAnnotations(ctx);
      };
    } else {
      canvas.width = 800;
      canvas.height = 400;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText("Học sinh không đính kèm ảnh bài làm cho câu này", 220, 200);
      renderAnnotations(ctx);
    }
  }, [activeImageIndex, essayImages.length, annotations, activeTab]);

  const renderAnnotations = (ctx: CanvasRenderingContext2D) => {
    annotations.forEach((item) => {
      if (item.type === "tick") {
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(item.x - 15, item.y);
        ctx.lineTo(item.x - 5, item.y + 12);
        ctx.lineTo(item.x + 20, item.y - 15);
        ctx.stroke();
      } else if (item.type === "cross") {
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(item.x - 12, item.y - 12);
        ctx.lineTo(item.x + 12, item.y + 12);
        ctx.moveTo(item.x + 12, item.y - 12);
        ctx.lineTo(item.x - 12, item.y + 12);
        ctx.stroke();
      } else if (item.type === "pen" && item.points && item.points.length > 1) {
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (tool === "tick" || tool === "cross") {
      setAnnotations((prev) => [...prev, { type: tool, x: coords.x, y: coords.y }]);
    } else if (tool === "pen") {
      setIsDrawing(true);
      currentPathRef.current = [coords];
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "pen") return;
    const coords = getCanvasCoords(e);
    currentPathRef.current.push(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 3;
    const points = currentPathRef.current;
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && tool === "pen") {
      setIsDrawing(false);
      if (currentPathRef.current.length > 1) {
        setAnnotations((prev) => [
          ...prev,
          { type: "pen", x: 0, y: 0, points: [...currentPathRef.current] },
        ]);
      }
      currentPathRef.current = [];
    }
  };

  const handleUndo = () => {
    setAnnotations((prev) => prev.slice(0, prev.length - 1));
  };

  const handleSaveGrade = async () => {
    setSaving(true);
    try {
      // Build updated answers map with teacher scores and comments
      const updatedAnswers = { ...(data?.submission?.answers || {}) };
      Object.keys(questionScores).forEach((qId) => {
        updatedAnswers[qId] = {
          ...(updatedAnswers[qId] || {}),
          teacher_score: questionScores[qId],
          teacher_comment: questionComments[qId] || "",
        };
      });

      const res = await fetch(`/api/submissions/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: roundedTotal,
          answers: updatedAnswers,
          teacher_feedback: feedback,
          essay_annotations: annotations,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Đã lưu điểm thành công: ${roundedTotal}/10 điểm!`);
        router.push(`/exams/${data?.submission?.exam_id}`);
      } else {
        toast.error(json.error || "Lưu điểm thất bại");
      }
    } catch (e: any) {
      toast.error("Lỗi mạng khi lưu kết quả");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const { submission, exam, questions, violations } = data || {};
  const studentAnswers = submission?.answers || {};

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-20">
      {/* Top action header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                Chấm bài: {submission?.student_name} {submission?.student_code ? `(${submission.student_code})` : ""}
              </h1>
              <p className="text-xs text-slate-500">
                {exam?.title} • Lớp: {submission?.class_name || "Tự do"}
              </p>
            </div>
          </div>

          {/* Quick Total Grading Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Tổng điểm:</span>
              <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                {roundedTotal}
              </span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>

            <button
              onClick={handleSaveGrade}
              disabled={saving}
              className="btn btn-primary px-4 py-2 text-sm"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Đang lưu..." : "Lưu kết quả chấm"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("questions")}
            className={`btn px-4 py-2 text-sm font-bold ${
              activeTab === "questions"
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Chấm từng câu hỏi ({questions?.length || 0} câu)</span>
          </button>

          {essayImages.length > 0 && (
            <button
              onClick={() => setActiveTab("canvas")}
              className={`btn px-4 py-2 text-sm font-bold ${
                activeTab === "canvas"
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Vẽ chấm trên ảnh ({essayImages.length} ảnh bài làm)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* TAB 1: QUESTION-BY-QUESTION GRADING */}
            {activeTab === "questions" && (
              <div className="space-y-6">
                {questions?.map((q: any, idx: number) => {
                  const studentAns = studentAnswers[q.id];
                  const currentScore = questionScores[q.id] ?? 0;
                  const isEssay = q.type === "essay";
                  const isSingle = q.type === "single_choice";
                  const isTrueFalse = q.type === "true_false";
                  const isShort = q.type === "short_answer";

                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold uppercase text-slate-500">
                            {isEssay ? "Câu tự luận" : isTrueFalse ? "Đúng / Sai" : isShort ? "Trả lời ngắn" : "Trắc nghiệm"}
                          </span>
                          <span className="text-xs text-slate-400">
                            (Thang điểm: {q.score}đ)
                          </span>
                        </div>

                        {/* Point input box */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Cho điểm:
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={q.score * 2}
                            value={currentScore}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setQuestionScores((prev) => ({ ...prev, [q.id]: val }));
                            }}
                            className="w-16 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-center font-bold text-emerald-600 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 text-sm"
                          />
                          <span className="text-xs text-slate-400">/{q.score}đ</span>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Đề bài:</p>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          <MathView content={q.content} />
                        </div>
                      </div>

                      {/* Student's Answer vs Correct Answer */}
                      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs font-semibold text-slate-500 block mb-1">
                              Bài làm của học sinh:
                            </span>
                            {isSingle && (
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Lựa chọn: <span className="text-emerald-600 font-black">{studentAns?.chosen || "Chưa làm"}</span>
                              </p>
                            )}
                            {isShort && (
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Câu trả lời: <span className="text-emerald-600 font-bold">{studentAns?.chosen || "Chưa làm"}</span>
                              </p>
                            )}
                            {isTrueFalse && studentAns?.chosen && (
                              <div className="text-xs space-y-1">
                                {Object.keys(studentAns.chosen).map((k) => (
                                  <span key={k} className="inline-block mr-3">
                                    Ý {k}: <strong>{studentAns.chosen[k] ? "Đúng" : "Sai"}</strong>
                                  </span>
                                ))}
                              </div>
                            )}
                            {isEssay && (
                              <div>
                                {studentAns?.essay_text ? (
                                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                    {studentAns.essay_text}
                                  </p>
                                ) : (
                                  <p className="text-xs italic text-slate-400">Học sinh không nhập bài làm dạng văn bản.</p>
                                )}

                                {studentAns?.images && studentAns.images.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                                      Ảnh chụp bài làm ({studentAns.images.length} ảnh):
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                      {studentAns.images.map((img: string, iIdx: number) => (
                                        <div key={iIdx} className="relative group">
                                          <img
                                            src={img}
                                            alt="Ảnh bài làm"
                                            className="h-28 w-28 rounded-xl object-cover border border-slate-300 shadow-sm"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveTab("canvas");
                                              // Find index of this image
                                              const found = essayImages.findIndex((item) => item.src === img);
                                              if (found !== -1) setActiveImageIndex(found);
                                            }}
                                            className="mt-1 text-[11px] font-semibold text-emerald-600 hover:underline block text-center"
                                          >
                                            Chấm trên ảnh này
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-semibold text-slate-500 block mb-1">Đáp án mẫu:</span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {q.correct_answer || "Theo barem tự luận"}
                            </span>
                          </div>
                        </div>

                        {/* Model explanation */}
                        {q.explanation && (
                          <div className="border-t border-slate-200 pt-2.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            <strong className="text-slate-800 dark:text-slate-200">Hướng dẫn chấm: </strong>
                            <MathView content={q.explanation} />
                          </div>
                        )}
                      </div>

                      {/* Teacher remark for this specific question */}
                      <div>
                        <input
                          type="text"
                          value={questionComments[q.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestionComments((prev) => ({ ...prev, [q.id]: val }));
                          }}
                          placeholder="Ghi chú nhận xét riêng cho câu này (ví dụ: Thiếu kết luận nghiệm...)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: CANVAS INTERACTIVE IMAGE GRADING */}
            {activeTab === "canvas" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTool("tick")}
                      className={`btn px-3.5 py-1.5 text-xs font-bold ${
                        tool === "tick"
                          ? "btn-primary"
                          : "btn-ghost"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                      <span>Đúng (✔)</span>
                    </button>

                    <button
                      onClick={() => setTool("cross")}
                      className={`btn px-3.5 py-1.5 text-xs font-bold ${
                        tool === "cross"
                          ? "bg-rose-600 text-white shadow-sm hover:bg-rose-500"
                          : "btn-ghost"
                      }`}
                    >
                      <X className="h-4 w-4" />
                      <span>Sai (✘)</span>
                    </button>

                    <button
                      onClick={() => setTool("pen")}
                      className={`btn px-3.5 py-1.5 text-xs font-bold ${
                        tool === "pen"
                          ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                          : "btn-ghost"
                      }`}
                    >
                      <PenTool className="h-4 w-4" />
                      <span>Bút đỏ</span>
                    </button>

                    <button
                      onClick={handleUndo}
                      title="Hoàn tác nét vẽ cuối"
                      className="btn btn-secondary px-3 py-1.5 text-xs font-medium"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Hoàn tác ({annotations.length})</span>
                    </button>
                  </div>

                  {/* Switch between images */}
                  {essayImages.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      {essayImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`btn h-8 px-3 text-xs font-bold ${
                            activeImageIndex === idx
                              ? "btn-primary"
                              : "btn-secondary"
                          }`}
                        >
                          Ảnh {idx + 1} (Câu {essayImages[idx].qIndex})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Canvas Container */}
                <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 flex justify-center p-3">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    className="max-w-full cursor-crosshair rounded-lg shadow-sm bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Feedback, Anti-cheat log & Summary (1 Col) */}
          <div className="space-y-6">
            {/* Overall Teacher Feedback Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Lời phê chung của Thầy/Cô</span>
              </h3>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ví dụ: Bài làm tốt, trình bày sạch đẹp. Cần chú ý điều kiện nghiệm câu 5..."
                className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Score Summary breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Bảng điểm chi tiết</span>
                <span className="text-emerald-600 font-black">{roundedTotal}/10đ</span>
              </h3>

              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {questions?.map((q: any, qIdx: number) => {
                  const pts = questionScores[q.id] ?? 0;
                  return (
                    <div key={q.id} className="py-2 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">
                        Câu {qIdx + 1} ({q.type === "essay" ? "Tự luận" : "Trắc nghiệm"})
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {pts} / {q.score}đ
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anti-cheat Log */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Nhật ký giám sát thi ({violations?.length || 0})</span>
              </h3>

              {violations && violations.length > 0 ? (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {violations.map((v: any, vIdx: number) => (
                    <div
                      key={vIdx}
                      className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                    >
                      <p className="font-semibold">{v.details || "Rời màn hình thi"}</p>
                      <p className="text-[10px] text-rose-600 mt-0.5">{v.occurred_at}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-emerald-600 font-medium">
                  Thí sinh làm bài nghiêm túc, không có vi phạm nào.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
