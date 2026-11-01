"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { GraduationCap, User, ArrowRight, ShieldCheck, KeyRound, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [roleTab, setRoleTab] = useState<"teacher" | "student">("teacher");

  // Form states
  const [username, setUsername] = useState("giaovien");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  // Student quick test code
  const [studentExamCode, setStudentExamCode] = useState("");

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem("thionline_user", JSON.stringify(json.user));
        toast.success(`Chào mừng Thầy/Cô ${json.user.name}!`);
        router.push("/dashboard");
      } else {
        toast.error(json.error || "Đăng nhập thất bại");
      }
    } catch (e: any) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentExamCode.trim()) {
      toast.warning("Vui lòng nhập mã đề hoặc link bài thi!");
      return;
    }
    const cleanId = studentExamCode.trim().replace(/^.*\/test\//, "");
    router.push(`/test/${cleanId}`);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md">
            T
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Đăng nhập ThiOnline
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Hệ thống thi & đánh giá trực tuyến
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setRoleTab("teacher")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              roleTab === "teacher"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/60"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Tôi là Giáo viên</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleTab("student")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              roleTab === "student"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/60"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Tôi là Học sinh</span>
          </button>
        </div>

        {/* TAB 1: TEACHER LOGIN */}
        {roleTab === "teacher" && (
          <form onSubmit={handleTeacherLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="giaovien"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Mật khẩu
              </label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              Tài khoản mẫu: <strong>giaovien</strong> • Mật khẩu: <strong>password123</strong>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-sm shadow-md"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập Giáo viên"}
            </button>
 
            <p className="text-center text-xs text-slate-500">
              Chưa có tài khoản Giáo viên?{" "}
              <Link href="/auth/register" className="font-semibold text-emerald-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        )}

        {/* TAB 2: STUDENT INSTRUCTIONS (NO ACCOUNT REQUIRED) */}
        {roleTab === "student" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <p className="font-bold text-sm mb-1">Học sinh không cần tài khoản!</p>
              <p className="leading-relaxed">
                Để làm bài, bạn chỉ cần mở link bài thi do thầy/cô cung cấp. Bạn chỉ cần chọn tên mình trong danh sách lớp hoặc nhập họ tên là có thể thi ngay mà không cần mật khẩu hay đăng ký tài khoản.
              </p>
            </div>

            <form onSubmit={handleStudentEnter} className="space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Nhập mã đề hoặc dán link bài thi:
              </label>
              <input
                type="text"
                value={studentExamCode}
                onChange={(e) => setStudentExamCode(e.target.value)}
                placeholder="Ví dụ: exam-demo-toan-12"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="w-full btn btn-primary py-3 text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Vào phòng thi ngay</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
