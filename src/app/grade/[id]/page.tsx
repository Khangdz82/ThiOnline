"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MathView } from "@/components/MathView";
import {
  Check,
  X,
  PenTool,
  RotateCcw,
  Save,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Eraser,
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
  const subId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Grading form state
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<"tick" | "cross" | "pen" | "eraser">("tick");
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
          setScore(json.submission.score || 0);
          setFeedback(json.submission.teacher_feedback || "");
          if (json.submission.essay_annotations) {
            setAnnotations(json.submission.essay_annotations);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (subId) fetchSub();
  }, [subId]);

  // Extract all submitted essay images
  const essayImages: { qIndex: number; src: string }[] = [];
  if (data?.submission?.answers) {
    const answers = data.submission.answers;
    Object.keys(answers).forEach((qId) => {
      const ans = answers[qId];
      if (ans.images && Array.isArray(ans.images)) {
        ans.images.forEach((imgSrc: string) => {
          essayImages.push({ qIndex: 1, src: imgSrc });
        });
      }
    });
  }

  // Draw background image and annotations onto canvas
  useEffect(() => {
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
      // Blank canvas for text feedback or grading
      canvas.width = 800;
      canvas.height = 600;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText("Học sinh không đính kèm ảnh bài làm cho câu này", 200, 300);
      renderAnnotations(ctx);
    }
  }, [activeImageIndex, essayImages.length, annotations]);

  const renderAnnotations = (ctx: CanvasRenderingContext2D) => {
    annotations.forEach((item) => {
      if (item.type === "tick") {
        ctx.strokeStyle = "#16a34a"; // green
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(item.x - 15, item.y);
        ctx.lineTo(item.x - 5, item.y + 12);
        ctx.lineTo(item.x + 20, item.y - 15);
        ctx.stroke();
      } else if (item.type === "cross") {
        ctx.strokeStyle = "#dc2626"; // red
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
      const res = await fetch(`/api/submissions/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(score),
          teacher_feedback: feedback,
          essay_annotations: annotations,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Đã lưu điểm và chấm bài thành công!");
        router.push(`/exams/${data?.submission?.exam_id}`);
      } else {
        alert("Lỗi lưu điểm: " + json.error);
      }
    } catch (e: any) {
      alert("Lỗi mạng: " + e.message);
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-20">
      {/* Top action header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                Chấm bài: {submission?.student_name} ({submission?.student_code || "SBD"})
              </h1>
              <p className="text-xs text-slate-500">
                {exam?.title} • Lớp: {submission?.class_name || "Tự do"}
              </p>
            </div>
          </div>

          {/* Quick Grading Inputs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Điểm số:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center font-bold text-emerald-600 dark:border-slate-600 dark:bg-slate-900 text-sm"
              />
              <span className="text-xs text-slate-400">/ 10</span>
            </div>

            <button
              onClick={handleSaveGrade}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Đang lưu..." : "Lưu kết quả"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas Photo Grading Tool (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTool("tick")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      tool === "tick"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    <span>Đúng (✔)</span>
                  </button>

                  <button
                    onClick={() => setTool("cross")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      tool === "cross"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <X className="h-4 w-4" />
                    <span>Sai (✘)</span>
                  </button>

                  <button
                    onClick={() => setTool("pen")}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      tool === "pen"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Bút đỏ</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    title="Hoàn tác nét vẽ cuối"
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Hoàn tác ({annotations.length})</span>
                  </button>

                  {essayImages.length > 1 && (
                    <div className="flex items-center gap-1">
                      {essayImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-7 px-2.5 rounded text-xs font-semibold ${
                            activeImageIndex === idx
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Trang {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 flex justify-center p-2">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="max-w-full cursor-crosshair rounded-lg shadow-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Feedback, Anti-cheat log, Question detail (1 Col) */}
          <div className="space-y-6">
            {/* Teacher Feedback Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Lời phê của Giáo viên</span>
              </h3>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ví dụ: Bài làm tốt, câu 3 chú ý điều kiện xác định..."
                className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Anti-cheat Log */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Nhật ký giám sát ({violations?.length || 0})</span>
              </h3>

              {violations && violations.length > 0 ? (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
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
                <p className="mt-3 text-xs text-slate-500">Thí sinh làm bài nghiêm túc, không có vi phạm.</p>
              )}
            </div>

            {/* Question overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white">Câu hỏi & Đáp án đúng</h3>
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                {questions?.map((q: any, qIdx: number) => (
                  <div key={q.id} className="text-xs border-b border-slate-100 pb-2 dark:border-slate-800">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
                      <span>Câu {qIdx + 1} ({q.type})</span>
                      <span className="text-emerald-600">Đ/A: {q.correct_answer || "Tự luận"}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-slate-500">
                      <MathView content={q.content} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
