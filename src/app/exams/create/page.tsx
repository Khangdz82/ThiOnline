"use client";

import React, { useEffect, useState } from "react";
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
  Brain,
  Coins,
  Database,
  Library,
  Grid3X3,
  FileSpreadsheet,
  Eye,
  RefreshCw,
  Clock,
  Calendar,
  Users,
  Check,
  Zap,
} from "lucide-react";

export default function CreateExamPage() {
  const router = useRouter();
  const toast = useToast();

  // 6 Creation Modes:
  // "file" (Word/Excel/PDF) | "ocr" (Image/PDF scan) | "bank" (Personal Bank) | "shared" (Shared Library) | "matrix" (Matrix) | "ai" (AI Assistant)
  const [creationTab, setCreationTab] = useState<"file" | "ocr" | "bank" | "shared" | "matrix" | "ai">("file");

  // Mode 1: File Upload / Paste text
  const [fileInputMode, setFileInputMode] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Mode 2: OCR
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(500);

  // Mode 3: Personal Question Bank
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<Record<string, boolean>>({});
  const [bankSubject, setBankSubject] = useState("Toán");
  const [bankGrade, setBankGrade] = useState("12");

  // Mode 4: Shared Exam Library
  const [sharedExams, setSharedExams] = useState<any[]>([]);
  const [previewSharedExam, setPreviewSharedExam] = useState<any | null>(null);

  // Mode 5: Matrix Builder
  const [matrixSubject, setMatrixSubject] = useState("Toán");
  const [matrixGrade, setMatrixGrade] = useState("12");
  const [matrixTopic, setMatrixTopic] = useState("Đề thi thử THPT Quốc Gia chuẩn GDPT 2018");
  const [matrixNhanBiet, setMatrixNhanBiet] = useState(4);
  const [matrixThongHieu, setMatrixThongHieu] = useState(4);
  const [matrixVanDung, setMatrixVanDung] = useState(2);
  const [matrixVanDungCao, setMatrixVanDungCao] = useState(1);
  const [matrixLoading, setMatrixLoading] = useState(false);

  // Mode 6: AI Generator
  const [aiSubject, setAiSubject] = useState("Toán");
  const [aiGrade, setAiGrade] = useState("12");
  const [aiTopic, setAiTopic] = useState("Khảo sát sự biến thiên và cực trị hàm số");
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState("single_choice");
  const [aiLoading, setAiLoading] = useState(false);

  // Exam Configuration Settings (Full Azota Configuration)
  const [title, setTitle] = useState("Đề kiểm tra chất lượng");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("12");
  const [duration, setDuration] = useState(45);
  const [examType, setExamType] = useState("test");
  const [password, setPassword] = useState("");
  const [antiCheatLevel, setAntiCheatLevel] = useState("strict");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [targetMode, setTargetMode] = useState<"public" | "classes">("public");
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allowViewScore, setAllowViewScore] = useState("after_submit");
  const [allowViewAnswers, setAllowViewAnswers] = useState(1);

  // Questions List
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserPoints();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (creationTab === "bank") {
      fetchBankQuestions();
    } else if (creationTab === "shared") {
      fetchSharedExams();
    }
  }, [creationTab, bankSubject, bankGrade]);

  const fetchUserPoints = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.user) {
        setUserPoints(json.user.points ?? 500);
      }
    } catch {}
  };

  const handleClaimBonusPoints = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100 }),
      });
      const json = await res.json();
      if (json.success) {
        setUserPoints(json.points);
        toast.success(json.message);
      }
    } catch {
      toast.error("Lỗi nạp Point");
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.success) {
        setClassesList(json.classes || []);
      }
    } catch {}
  };

  const fetchBankQuestions = async () => {
    try {
      const res = await fetch(`/api/question-bank?subject=${encodeURIComponent(bankSubject)}`);
      const json = await res.json();
      if (json.success) {
        setBankQuestions(json.questions || []);
      }
    } catch {}
  };

  const fetchSharedExams = async () => {
    try {
      const res = await fetch("/api/shared-exams");
      const json = await res.json();
      if (json.success) {
        setSharedExams(json.exams || []);
      }
    } catch {}
  };

  // 1. Handle Parse from Word/Excel/File
  const handleParseFile = async () => {
    setIsParsing(true);
    try {
      let res;
      if (fileInputMode === "upload" && selectedFile) {
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

  // 2. Handle OCR Scan (Using Point)
  const handleOcrScan = async () => {
    if (!ocrFile) {
      toast.warning("Vui lòng chọn file ảnh bài thi hoặc PDF scan!");
      return;
    }

    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", ocrFile);

      const res = await fetch("/api/exams/ocr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.questions) {
        setQuestions(json.questions);
        setUserPoints(json.remainingPoints);
        toast.success(json.message);
        if (title === "Đề kiểm tra chất lượng") {
          setTitle(`Đề số hóa OCR (${json.questions.length} câu)`);
        }
      } else {
        toast.error(json.error || "Lỗi số hóa đề OCR");
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối OCR: " + err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  // 3. Handle Add from Personal Question Bank
  const handleAddFromBank = () => {
    const selected = bankQuestions.filter((q) => selectedBankIds[q.id]);
    if (selected.length === 0) {
      toast.warning("Vui lòng tích chọn ít nhất 1 câu hỏi từ ngân hàng!");
      return;
    }

    const formatted = selected.map((q, idx) => ({
      index: questions.length + idx + 1,
      type: q.type || "single_choice",
      content: q.content,
      options: typeof q.options === "string" ? JSON.parse(q.options || "[]") : q.options,
      correct_answer: q.correct_answer || "A",
      explanation: q.explanation || "",
      score: 1.0,
    }));

    setQuestions([...questions, ...formatted]);
    toast.success(`Đã thêm ${formatted.length} câu hỏi vào đề thi!`);
    setSelectedBankIds({});
  };

  // 4. Handle Use Shared Exam
  const handleUseSharedExam = (ex: any) => {
    setQuestions(ex.questions || []);
    setTitle(ex.title);
    setSubject(ex.subject);
    setGrade(ex.grade);
    setDuration(ex.duration || 45);
    setDescription(ex.description || "");
    setPreviewSharedExam(null);
    toast.success(`Đã tải toàn bộ đề mẫu: ${ex.title}!`);
  };

  // 5. Handle Matrix Generation
  const handleGenerateFromMatrix = async () => {
    setMatrixLoading(true);
    try {
      const res = await fetch("/api/exams/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: matrixSubject,
          grade: matrixGrade,
          topic: matrixTopic,
          nhan_biet: matrixNhanBiet,
          thong_hieu: matrixThongHieu,
          van_dung: matrixVanDung,
          van_dung_cao: matrixVanDungCao,
        }),
      });

      const json = await res.json();
      if (json.success && json.questions) {
        setQuestions(json.questions);
        setTitle(json.title);
        setSubject(matrixSubject);
        setGrade(matrixGrade);
        toast.success(`Đã sinh đề thành công theo ma trận (${json.questions.length} câu)!`);
      } else {
        toast.error("Lỗi sinh đề theo ma trận: " + json.error);
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối ma trận: " + err.message);
    } finally {
      setMatrixLoading(false);
    }
  };

  // 6. Handle AI Generation
  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/exams/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: aiSubject,
          grade: aiGrade,
          topic: aiTopic,
          count: aiCount,
          type: aiType,
        }),
      });

      const json = await res.json();
      if (json.success && json.questions) {
        setQuestions(json.questions);
        setTitle(json.title);
        setSubject(aiSubject);
        setGrade(aiGrade);
        toast.success(`AI đã sinh ${json.questions.length} câu hỏi thành công!`);
      } else {
        toast.error("Lỗi AI sinh câu hỏi: " + json.error);
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối AI: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Save Final Exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning("Vui lòng nhập tên đề thi!");
      return;
    }
    if (questions.length === 0) {
      toast.warning("Đề thi chưa có câu hỏi nào! Hãy chọn một trong 6 phương thức tạo đề.");
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
          subject,
          grade,
          duration: Number(duration),
          exam_type: examType,
          password,
          anti_cheat_level: antiCheatLevel,
          shuffle_questions: shuffleQuestions ? 1 : 0,
          shuffle_options: shuffleOptions ? 1 : 0,
          max_attempts: Number(maxAttempts),
          target_mode: targetMode,
          assigned_class_ids: targetMode === "classes" ? assignedClassIds : [],
          start_time: startTime || null,
          end_time: endTime || null,
          allow_view_score: allowViewScore,
          allow_view_answers: allowViewAnswers,
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

  const handleRemoveQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, index: i + 1 }));
    setQuestions(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tạo Đề thi & Bài tập Đa nguồn
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hỗ trợ 6 phương thức tạo đề: Word/Excel/PDF, Số hóa OCR, Ngân hàng câu hỏi, Kho đề chung, Ma trận chuẩn & Trợ lý AI.
          </p>
        </div>

        {/* User Points Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <Coins className="h-4 w-4 text-amber-600" />
            <span>Point của bạn: {userPoints}</span>
          </div>
          <button
            type="button"
            onClick={handleClaimBonusPoints}
            className="btn btn-secondary px-3 py-1.5 text-xs font-semibold"
            title="Nhận 100 Point trải nghiệm miễn phí"
          >
            + Nạp 100 Point demo
          </button>
        </div>
      </div>

      {/* 6 Creation Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setCreationTab("file")}
          className={`btn px-3 py-2.5 text-xs font-bold ${
            creationTab === "file" ? "btn-primary shadow-sm" : "btn-secondary"
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>1. Tải Word / Excel</span>
        </button>

        <button
          type="button"
          onClick={() => setCreationTab("ocr")}
          className={`btn px-3 py-2.5 text-xs font-bold ${
            creationTab === "ocr" ? "btn-primary shadow-sm" : "btn-secondary"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>2. Số hóa OCR</span>
        </button>

        <button
          type="button"
          onClick={() => setCreationTab("bank")}
          className={`btn px-3 py-2.5 text-xs font-bold ${
            creationTab === "bank" ? "btn-primary shadow-sm" : "btn-secondary"
          }`}
        >
          <Database className="h-4 w-4" />
          <span>3. Ngân hàng cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setCreationTab("shared")}
          className={`btn px-3 py-2.5 text-xs font-bold ${
            creationTab === "shared" ? "btn-primary shadow-sm" : "btn-secondary"
          }`}
        >
          <Library className="h-4 w-4" />
          <span>4. Kho đề chung</span>
        </button>

        <button
          type="button"
          onClick={() => setCreationTab("matrix")}
          className={`btn px-3 py-2.5 text-xs font-bold ${
            creationTab === "matrix" ? "btn-primary shadow-sm" : "btn-secondary"
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          <span>5. Ma trận Bộ GD&ĐT</span>
        </button>

        <button
          type="button"
          onClick={() => setCreationTab("ai")}
          className={`btn px-3 py-2.5 text-xs font-bold ${
            creationTab === "ai" ? "btn-primary shadow-sm" : "btn-secondary"
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>6. Trợ lý AI sinh đề</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Source Mode Workspace + Live Questions Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: FILE WORD / EXCEL / PASTE */}
          {creationTab === "file" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFileInputMode("upload")}
                  className={`btn px-4 py-2 text-xs font-bold ${
                    fileInputMode === "upload" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload File (.docx, .xlsx, .csv, .txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFileInputMode("paste")}
                  className={`btn px-4 py-2 text-xs font-bold ${
                    fileInputMode === "paste" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Dán văn bản trực tiếp</span>
                </button>
              </div>

              {fileInputMode === "upload" ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-emerald-500 transition-colors dark:border-slate-700">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <FileText className="h-8 w-8" />
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedFile ? selectedFile.name : "Kéo thả hoặc chọn file Word (.docx) hoặc Excel (.xlsx)"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Hệ thống tự động bóc tách câu hỏi, các phương án A/B/C/D, bảng đáp án và công thức Toán KaTeX.
                  </p>
                  <input
                    type="file"
                    accept=".docx, .xlsx, .xls, .csv, .txt"
                    id="docFileInput"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                  <div className="mt-4 flex items-center gap-3">
                    <label htmlFor="docFileInput" className="btn btn-dark px-4 py-2 text-xs cursor-pointer">
                      Chọn file từ máy tính
                    </label>
                    <button
                      type="button"
                      disabled={isParsing || !selectedFile}
                      onClick={handleParseFile}
                      className="btn btn-primary px-4 py-2 text-xs"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isParsing ? "Đang phân tích..." : "Phân tích file ngay"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`Dán nội dung đề thi vào đây, ví dụ:\nCâu 1: Cho hàm số y = f(x). Khẳng định nào đúng?\nA. f(x) > 0\nB. f(x) < 0\nC. f(x) = 0\nD. f(x) không đổi\nĐáp án: A\n\nBẢNG ĐÁP ÁN:\n1.A 2.B 3.C`}
                    className="w-full rounded-xl border border-slate-300 p-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      * Tự động nhận diện công thức Toán trong dấu $...$ hoặc $$...$$
                    </span>
                    <button
                      type="button"
                      disabled={isParsing || !rawText.trim()}
                      onClick={handleParseFile}
                      className="btn btn-primary px-5 py-2.5 text-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isParsing ? "Đang phân tích..." : "Phân tích & Tách câu hỏi"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OCR DIGITIZATION (USING POINT) */}
          {creationTab === "ocr" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span>Số hóa đề từ Ảnh / PDF bằng OCR</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phí dịch vụ: <strong>10 Point / 1 trang số hóa</strong> (Hiện có: <strong>{userPoints} Point</strong>)
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-8 text-center dark:border-amber-900/60 dark:bg-amber-950/20">
                <Upload className="h-10 w-10 text-amber-600" />
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                  {ocrFile ? ocrFile.name : "Tải lên ảnh chụp bài thi (.png, .jpg, .webp) hoặc file scan"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Hệ thống OCR nhận diện chữ tiếng Việt, tự động bóc tách các câu hỏi và công thức Toán học.
                </p>
                <input
                  type="file"
                  accept="image/*, application/pdf"
                  id="ocrFileInput"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setOcrFile(e.target.files[0]);
                  }}
                />
                <div className="mt-4 flex items-center gap-3">
                  <label htmlFor="ocrFileInput" className="btn btn-dark px-4 py-2 text-xs cursor-pointer">
                    Chọn ảnh bài thi
                  </label>
                  <button
                    type="button"
                    disabled={ocrLoading || !ocrFile}
                    onClick={handleOcrScan}
                    className="btn btn-primary px-4 py-2 text-xs"
                  >
                    <Coins className="h-4 w-4" />
                    <span>{ocrLoading ? "Đang số hóa..." : "Số hóa qua OCR (10 Point)"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL QUESTION BANK */}
          {creationTab === "bank" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" />
                    <span>Ngân hàng câu hỏi cá nhân</span>
                  </h3>
                  <p className="text-xs text-slate-500">Tích chọn câu hỏi đã lưu để đưa vào đề thi.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={bankSubject}
                    onChange={(e) => setBankSubject(e.target.value)}
                    className="rounded-xl border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddFromBank}
                    className="btn btn-primary px-3.5 py-1.5 text-xs font-semibold"
                  >
                    + Thêm câu đã chọn vào đề
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {bankQuestions.map((q) => {
                  const isChecked = !!selectedBankIds[q.id];
                  return (
                    <div
                      key={q.id}
                      onClick={() =>
                        setSelectedBankIds({
                          ...selectedBankIds,
                          [q.id]: !isChecked,
                        })
                      }
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded text-emerald-600"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-emerald-600">{q.subject} {q.grade}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {q.cognitive_level}
                          </span>
                        </div>
                        <MathView content={q.content} />
                      </div>
                    </div>
                  );
                })}
                {bankQuestions.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Chưa có câu hỏi nào trong ngân hàng môn {bankSubject}. Hãy vào mục &quot;Ngân hàng câu hỏi&quot; để thêm.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SHARED EXAM LIBRARY */}
          {creationTab === "shared" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Library className="h-5 w-5 text-blue-600" />
                  <span>Kho đề chung ThiOnline (Chuẩn Bộ GD&ĐT)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn đề thi mẫu từ kho tài nguyên chuẩn của giáo viên trên toàn quốc để sử dụng ngay.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {ex.subject} {ex.grade}
                        </span>
                        <span>{ex.downloads} lượt tải</span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {ex.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {ex.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-700">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        {ex.duration} phút ({ex.question_count} câu)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUseSharedExam(ex)}
                        className="btn btn-primary px-3 py-1.5 text-xs font-semibold"
                      >
                        Sử dụng đề này
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MATRIX BUILDER */}
          {creationTab === "matrix" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-indigo-600" />
                  <span>Tạo đề theo Ma trận chuẩn Bộ Giáo dục & Đào tạo</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Kiểm soát số lượng câu hỏi và tỷ lệ phân bố theo 4 mức độ nhận thức (Thang điểm 10 chuẩn).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Môn học</label>
                  <select
                    value={matrixSubject}
                    onChange={(e) => setMatrixSubject(e.target.value)}
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Khối lớp</label>
                  <select
                    value={matrixGrade}
                    onChange={(e) => setMatrixGrade(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="12">Khối 12</option>
                    <option value="11">Khối 11</option>
                    <option value="10">Khối 10</option>
                    <option value="9">Khối 9</option>
                  </select>
                </div>
              </div>

              {/* 4 Cognitive Levels Grid */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Số lượng câu theo 4 mức độ nhận thức:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">1. Nhận biết (40%)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matrixNhanBiet}
                      onChange={(e) => setMatrixNhanBiet(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">2. Thông hiểu (30%)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matrixThongHieu}
                      onChange={(e) => setMatrixThongHieu(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">3. Vận dụng (20%)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matrixVanDung}
                      onChange={(e) => setMatrixVanDung(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">4. Vận dụng cao (10%)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matrixVanDungCao}
                      onChange={(e) => setMatrixVanDungCao(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={matrixLoading}
                  onClick={handleGenerateFromMatrix}
                  className="btn btn-primary px-5 py-2.5 text-sm"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>{matrixLoading ? "Đang sinh đề..." : "Tự động sinh đề theo ma trận"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: AI GENERATOR */}
          {creationTab === "ai" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Trợ lý AI hỗ trợ sinh đề thi</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập chủ đề kiến thức mong muốn, AI sẽ tự động sinh câu hỏi kèm công thức Toán KaTeX, đáp án và lời giải.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Môn học</label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Khối lớp</label>
                  <select
                    value={aiGrade}
                    onChange={(e) => setAiGrade(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="12">Khối 12</option>
                    <option value="11">Khối 11</option>
                    <option value="10">Khối 10</option>
                    <option value="9">Khối 9</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Chủ đề / Bài học mong muốn sinh đề
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Đồ thị hàm phân thức, Nguyên hàm từng phần, Dao động tắt dần..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Số lượng câu hỏi</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Dạng câu hỏi</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="single_choice">Trắc nghiệm 4 lựa chọn (A/B/C/D)</option>
                    <option value="true_false">Đúng / Sai chuẩn GDPT 2018</option>
                    <option value="essay">Tự luận có lời giải</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleGenerateAI}
                  className="btn btn-primary px-5 py-2.5 text-sm"
                >
                  <Brain className="h-4 w-4" />
                  <span>{aiLoading ? "AI đang suy nghĩ & sinh đề..." : "AI Sinh câu hỏi ngay"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Parsed / Selected Questions List Preview */}
          {questions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Danh sách câu hỏi trong đề ({questions.length} câu)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setQuestions([])}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {questions.map((q: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-2 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      title="Xóa câu này"
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Câu {idx + 1}</span>
                      <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[10px] dark:bg-slate-700">
                        {q.type}
                      </span>
                      <span className="font-semibold text-emerald-600">
                        Đáp án đúng: {q.correct_answer || "Chưa có"}
                      </span>
                    </div>

                    <div className="text-sm text-slate-800 dark:text-slate-200">
                      <MathView content={q.content} />
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt: any) => (
                          <div
                            key={opt.id}
                            className={`rounded-lg border p-2 flex items-start gap-1.5 ${
                              opt.id === q.correct_answer
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-950/40 dark:text-emerald-300"
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
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 pt-2 dark:border-slate-700">
                        <strong>Lời giải:</strong> <MathView content={q.explanation} />
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

            {/* Title */}
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

            {/* Subject and Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                  Môn học
                </label>
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
                  <option value="Lịch sử">Lịch sử</option>
                  <option value="Địa lý">Địa lý</option>
                  <option value="Tin học">Tin học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                  Khối lớp
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="12">Khối 12</option>
                  <option value="11">Khối 11</option>
                  <option value="10">Khối 10</option>
                  <option value="9">Khối 9</option>
                  <option value="8">Khối 8</option>
                  <option value="Đại học">Đại học</option>
                </select>
              </div>
            </div>

            {/* Duration and Max Attempts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                  Thời gian (phút)
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
                  Số lượt thi
                </label>
                <select
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={1}>1 lượt (Chuẩn thi)</option>
                  <option value={2}>2 lượt</option>
                  <option value={3}>3 lượt</option>
                  <option value={9999}>Không giới hạn</option>
                </select>
              </div>
            </div>

            {/* Target Audience: Public vs Assigned Classes */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Đối tượng tham gia dự thi
              </label>
              <div className="mt-1 flex rounded-xl border border-slate-200 p-1 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetMode("public")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    targetMode === "public"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Tự do (Tất cả)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode("classes")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    targetMode === "classes"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Chỉ định lớp
                </button>
              </div>

              {targetMode === "classes" && (
                <div className="mt-2 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Chọn các lớp được phép vào thi:
                  </span>
                  {classesList.map((cls) => {
                    const isSelected = assignedClassIds.includes(cls.id);
                    return (
                      <label key={cls.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedClassIds([...assignedClassIds, cls.id]);
                            } else {
                              setAssignedClassIds(assignedClassIds.filter((id) => id !== cls.id));
                            }
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span>{cls.name} (Khối {cls.grade})</span>
                      </label>
                    );
                  })}
                  {classesList.length === 0 && (
                    <p className="text-slate-400">Chưa có lớp nào. Hãy tạo lớp trong mục Quản lý Lớp.</p>
                  )}
                </div>
              )}
            </div>

            {/* Anti-cheat & Password */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Cấp độ chống gian lận
              </label>
              <select
                value={antiCheatLevel}
                onChange={(e) => setAntiCheatLevel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="strict">Nghiêm ngặt (Toàn màn hình + bắt chuyển tab)</option>
                <option value="basic">Cơ bản (Cảnh báo khi rời tab)</option>
                <option value="none">Tự do (Luyện tập ở nhà)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Mật khẩu phòng thi (để trống nếu tự do)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ví dụ: 123456"
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Shuffling Options */}
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

            {/* View Score and Answer Configurations */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Hiển thị điểm số cho học sinh
                </label>
                <select
                  value={allowViewScore}
                  onChange={(e) => setAllowViewScore(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="after_submit">Ngay sau khi nộp bài</option>
                  <option value="after_end">Khi đề thi kết thúc</option>
                  <option value="never">Không hiển thị điểm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Hiển thị đáp án & lời giải chi tiết
                </label>
                <select
                  value={allowViewAnswers}
                  onChange={(e) => setAllowViewAnswers(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={1}>Cho phép xem sau khi nộp</option>
                  <option value={0}>Khóa đáp án (Bảo mật đề)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting || questions.length === 0}
                className="w-full btn btn-primary py-3 text-sm shadow-md"
              >
                {isSubmitting ? "Đang lưu đề thi..." : `Lưu & Xuất bản (${questions.length} câu)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}