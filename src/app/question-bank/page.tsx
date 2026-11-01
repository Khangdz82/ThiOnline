"use client";

import React, { useEffect, useState } from "react";
import { MathView } from "@/components/MathView";
import { useToast } from "@/components/Toast";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Bookmark,
} from "lucide-react";

export default function QuestionBankPage() {
  const toast = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("Toán");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [content, setContent] = useState("");
  const [options, setOptions] = useState([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [cognitiveLevel, setCognitiveLevel] = useState("thong_hieu");
  const [grade, setGrade] = useState("12");

  useEffect(() => {
    fetchQuestions();
  }, [subject, searchQuery]);

  const fetchQuestions = async () => {
    try {
      const url = `/api/question-bank?subject=${encodeURIComponent(subject)}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade,
          content,
          options,
          correct_answer: correctAnswer,
          explanation,
          cognitive_level: cognitiveLevel,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setContent("");
        setExplanation("");
        toast.success("Đã thêm câu hỏi vào ngân hàng thành công!");
        fetchQuestions();
      }
    } catch (e) {
      toast.error("Lỗi thêm câu hỏi vào ngân hàng");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ngân hàng Câu hỏi Chuẩn GDPT 2018
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lưu trữ, phân loại câu hỏi theo môn học, khối lớp và 4 mức độ nhận thức.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>+ Thêm câu hỏi vào kho</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi, công thức toán..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="Toán">Môn Toán</option>
            <option value="Vật lý">Môn Vật lý</option>
            <option value="Hóa học">Môn Hóa học</option>
            <option value="Sinh học">Môn Sinh học</option>
            <option value="Tiếng Anh">Môn Tiếng Anh</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Câu #{idx + 1} • {q.subject} {q.grade}
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {q.cognitive_level === "nhan_biet"
                    ? "Nhận biết"
                    : q.cognitive_level === "thong_hieu"
                    ? "Thông hiểu"
                    : q.cognitive_level === "van_dung"
                    ? "Vận dụng"
                    : "Vận dụng cao"}
                </span>
              </div>
              <span className="font-semibold text-emerald-600">
                Đáp án: {q.correct_answer}
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
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {/* MODAL: ADD QUESTION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateQuestion} className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm câu hỏi mới vào kho</h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Môn học</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Toán">Toán</option>
                  <option value="Vật lý">Vật lý</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Sinh học">Sinh học</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Khối lớp / Cấp học</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <optgroup label="Cấp 3 - THPT">
                    <option value="12">Lớp 12</option>
                    <option value="11">Lớp 11</option>
                    <option value="10">Lớp 10</option>
                  </optgroup>
                  <optgroup label="Cấp 2 - THCS">
                    <option value="9">Lớp 9</option>
                    <option value="8">Lớp 8</option>
                    <option value="7">Lớp 7</option>
                    <option value="6">Lớp 6</option>
                  </optgroup>
                  <optgroup label="Cấp 1 - Tiểu học">
                    <option value="5">Lớp 5</option>
                    <option value="4">Lớp 4</option>
                    <option value="3">Lớp 3</option>
                    <option value="2">Lớp 2</option>
                    <option value="1">Lớp 1</option>
                  </optgroup>
                  <optgroup label="Đại học & Đào tạo khác">
                    <option value="Đại học">Đại học / Cao đẳng</option>
                    <option value="Luyện thi">Luyện thi ĐGNL / Tốt nghiệp</option>
                    <option value="Khác">Khác</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Mức độ nhận thức</label>
                <select
                  value={cognitiveLevel}
                  onChange={(e) => setCognitiveLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="nhan_biet">Nhận biết</option>
                  <option value="thong_hieu">Thông hiểu</option>
                  <option value="van_dung">Vận dụng</option>
                  <option value="van_dung_cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Nội dung câu hỏi</label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung câu hỏi (chèn công thức bằng $...$)"
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Các phương án lựa chọn</label>
              {options.map((opt, oIdx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="font-bold text-xs w-4">{opt.id}.</span>
                  <input
                    type="text"
                    required
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[oIdx].text = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Nội dung phương án ${opt.id}`}
                    className="flex-1 rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="radio"
                    name="correctChoice"
                    checked={correctAnswer === opt.id}
                    onChange={() => setCorrectAnswer(opt.id)}
                    className="text-emerald-600"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Lời giải chi tiết</label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Nhập hướng dẫn giải (tùy chọn)"
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost px-4 py-2 text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 text-xs"
              >
                Lưu vào kho
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
