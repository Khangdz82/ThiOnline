"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MathView } from "@/components/MathView";
import { useToast } from "@/components/Toast";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Settings2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function CreateExamPage() {
  const router = useRouter();
  const toast = useToast();

  // Mode: "upload" (file docx) or "paste" (raw text) or "manual"
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Exam Configuration
  const [title, setTitle] = useState("Đề kiểm tra chất lượng");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(45);
  const [examType, setExamType] = useState("test");
  const [password, setPassword] = useState("");
  const [antiCheatLevel, setAntiCheatLevel] = useState("strict");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [allowViewScore, setAllowViewScore] = useState("after_submit");

  // Parsed Questions List
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Parse from file or text
  const handleParse = async () => {
    setIsParsing(true);
    try {
      let res;
      if (inputMode === "upload" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        res = await fetch("/api/exams/parse", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/exams/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText }),
        });
      }

      const json = await res.json();
      if (json.success && json.questions) {
        setQuestions(json.questions);
        toast.success(`Đã nhận diện thành công ${json.questions.length} câu hỏi!`);
        if (json.questions.length > 0 && title === "Đề kiểm tra chất lượng") {
          setTitle(`Đề thi gồm ${json.questions.length} câu`);
        }
      } else {
        toast.error("Không thể bóc tách đề: " + (json.error || "Vui lòng kiểm tra định dạng"));
      }
    } catch (err: any) {
      toast.error("Lỗi phân tích đề thi: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Create & Save Exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning("Vui lòng nhập tên đề thi!");
      return;
    }
    if (questions.length === 0) {
      toast.warning("Đề thi chưa có câu hỏi nào! Hãy tải file hoặc dán văn bản để bóc tách.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          duration: Number(duration),
          exam_type: examType,
          password,
          anti_cheat_level: antiCheatLevel,
          shuffle_questions: shuffleQuestions ? 1 : 0,
          shuffle_options: shuffleOptions ? 1 : 0,
          allow_view_score: allowViewScore,
          questions,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Tạo đề thi thành công!");
        router.push(`/exams/${json.examId}`);
      } else {
        toast.error("Lưu đề thất bại: " + json.error);
      }
    } catch (e: any) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tạo Đề thi & Bài tập Thông minh
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tải file Word (.docx) hoặc dán văn bản. Bộ phân tích tự động nhận diện câu hỏi, các đáp án A/B/C/D, công thức KaTeX và lời giải.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input and Live Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Box Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Mode switch */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`btn px-4 py-2 text-sm ${
                  inputMode === "upload"
                    ? "btn-primary"
                    : "btn-ghost border-transparent"
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Upload file Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`btn px-4 py-2 text-sm ${
                  inputMode === "paste"
                    ? "btn-primary"
                    : "btn-ghost border-transparent"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Dán văn bản trực tiếp</span>
              </button>
            </div>

            {/* Input area */}
            <div className="mt-4">
              {inputMode === "upload" ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-emerald-500 transition-colors dark:border-slate-700">
                  <Upload className="h-10 w-10 text-emerald-600" />
                  <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                    {selectedFile ? selectedFile.name : "Kéo thả hoặc chọn file đề thi Word (.docx)"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Hỗ trợ file Microsoft Word định dạng chuẩn thi THPT / GDPT 2018
                  </p>
                  <input
                    type="file"
                    accept=".docx"
                    id="docxInput"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                  <label
                    htmlFor="docxInput"
                    className="mt-4 btn btn-dark px-4 py-2 text-xs cursor-pointer"
                  >
                    Chọn file từ máy tính
                  </label>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`Dán nội dung đề thi vào đây, ví dụ:\nCâu 1: Cho hàm số y = f(x). Khẳng định nào đúng?\nA. f(x) > 0\nB. f(x) < 0\nC. f(x) = 0\nD. f(x) không đổi\nĐáp án: A\n\nBẢNG ĐÁP ÁN:\n1.A 2.B 3.C`}
                    className="w-full rounded-xl border border-slate-300 p-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  * Tự động nhận diện công thức Toán trong dấu $...$ hoặc $$...$$
                </span>
                <button
                  type="button"
                  disabled={isParsing || (inputMode === "upload" && !selectedFile) || (inputMode === "paste" && !rawText.trim())}
                  onClick={handleParse}
                  className="btn btn-primary px-5 py-2.5 text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isParsing ? "Đang phân tích..." : "Phân tích & Tách câu hỏi"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Parsed Preview Section */}
          {questions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Đã nhận diện {questions.length} câu hỏi</span>
                </h3>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Câu {idx + 1} ({q.type})
                      </span>
                      <span className="font-semibold text-emerald-600">
                        Đáp án đúng: {q.correct_answer || "Chưa có"}
                      </span>
                    </div>

                    <div className="text-sm text-slate-800 dark:text-slate-200">
                      <MathView content={q.content} />
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Settings & Publish (1 Col) */}
        <div className="space-y-6">
          <form onSubmit={handleSaveExam} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Settings2 className="h-5 w-5 text-emerald-600" />
              <span>Cấu hình phòng thi</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Tên đề thi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Thời gian làm bài (phút)
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 45)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Mật khẩu đề thi (để trống nếu tự do)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ví dụ: 123456"
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Cấp độ chống gian lận
              </label>
              <select
                value={antiCheatLevel}
                onChange={(e) => setAntiCheatLevel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="strict">Nghiêm ngặt (Toàn màn hình + bắt rời tab)</option>
                <option value="basic">Cơ bản (Cảnh báo khi rời tab)</option>
                <option value="none">Tự do (Luyện tập ở nhà)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Đảo thứ tự câu hỏi khi làm bài</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Đảo thứ tự đáp án (A/B/C/D)</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting || questions.length === 0}
                className="w-full btn btn-primary py-3 text-sm shadow-md"
              >
                {isSubmitting ? "Đang lưu đề thi..." : "Lưu & Xuất bản Đề thi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
