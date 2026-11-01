"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Users,
  Plus,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  GraduationCap,
  FileSpreadsheet,
} from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New class modal / form
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("12");

  // New student form
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [gender, setGender] = useState("Nam");
  const [dob, setDob] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.success) {
        setClasses(json.classes || []);
        if (json.classes?.length > 0 && !selectedClass) {
          selectClass(json.classes[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectClass = async (cls: any) => {
    setSelectedClass(cls);
    try {
      const res = await fetch(`/api/classes/${cls.id}/students`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName, grade: newClassGrade }),
      });
      const json = await res.json();
      if (json.success) {
        setShowNewClass(false);
        setNewClassName("");
        await fetchClasses();
      }
    } catch (e) {
      alert("Lỗi tạo lớp");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !selectedClass) return;

    try {
      const res = await fetch(`/api/classes/${selectedClass.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName,
          student_code: studentCode,
          gender,
          dob,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowNewStudent(false);
        setStudentName("");
        setStudentCode("");
        selectClass(selectedClass);
      }
    } catch (e) {
      alert("Lỗi thêm học sinh");
    }
  };

  // Import students from Excel file
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formatted = data.map((row) => ({
          name: row["Họ và tên"] || row["Họ tên"] || row["Name"] || Object.values(row)[1] || "Học sinh",
          student_code: String(row["SBD"] || row["Mã HS"] || row["Code"] || ""),
          gender: String(row["Giới tính"] || row["Gender"] || ""),
          dob: String(row["Ngày sinh"] || row["DOB"] || ""),
        }));

        if (formatted.length > 0) {
          const res = await fetch(`/api/classes/${selectedClass.id}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ students: formatted }),
          });
          const json = await res.json();
          if (json.success) {
            alert(`Đã thêm thành công ${json.count} học sinh vào lớp!`);
            selectClass(selectedClass);
          }
        }
      } catch (err) {
        alert("Lỗi đọc file Excel: Vui lòng kiểm tra file đúng định dạng cột: Họ và tên, SBD, Giới tính, Ngày sinh.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý Lớp học & Danh sách Học sinh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo lớp học, import danh sách học sinh từ file Excel, phân quyền làm bài thi theo lớp.
          </p>
        </div>

        <button
          onClick={() => setShowNewClass(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tạo lớp mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Classes List (1 Col) */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Danh sách lớp ({classes.length})
          </h2>

          <div className="space-y-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => selectClass(cls)}
                className={`w-full flex items-center justify-between rounded-xl p-3.5 text-left text-sm font-semibold transition-all ${
                  selectedClass?.id === cls.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                }`}
              >
                <div>
                  <p>{cls.name}</p>
                  <span
                    className={`text-xs ${
                      selectedClass?.id === cls.id ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    Mã lớp: {cls.code}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    selectedClass?.id === cls.id
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                  }`}
                >
                  {cls.student_count || 0} HS
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Students Table (3 Cols) */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {selectedClass ? (
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedClass.name} (Khối {selectedClass.grade})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mã mời tham gia: <strong className="text-emerald-600">{selectedClass.code}</strong> • Sĩ số: {students.length} học sinh
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Import Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={handleImportExcel}
                    />
                  </label>

                  <button
                    onClick={() => setShowNewStudent(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Thêm học sinh</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs font-semibold text-slate-500 dark:border-slate-800">
                    <tr>
                      <th className="pb-3">STT</th>
                      <th className="pb-3">Số báo danh (SBD)</th>
                      <th className="pb-3">Họ và tên</th>
                      <th className="pb-3">Giới tính</th>
                      <th className="pb-3">Ngày sinh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {std.student_code || "---"}
                        </td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">
                          {std.name}
                        </td>
                        <td className="py-3 text-slate-500 text-xs">{std.gender || "---"}</td>
                        <td className="py-3 text-slate-500 text-xs">{std.dob || "---"}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                          Chưa có học sinh trong lớp này. Hãy bấm &quot;Thêm học sinh&quot; hoặc &quot;Import Excel&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Chọn một lớp học để xem danh sách.</div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE CLASS */}
      {showNewClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateClass} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tạo lớp học mới</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Tên lớp</label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ví dụ: 10A1 hoặc Luyện thi Đại học"
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Khối lớp</label>
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewClass(false)}
                className="rounded-lg border px-4 py-2 text-sm text-slate-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Tạo lớp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {showNewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddStudent} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm học sinh mới</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Họ và tên</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Hoàng Minh Đức"
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Số báo danh (SBD)</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="SBD010"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewStudent(false)}
                className="rounded-lg border px-4 py-2 text-sm text-slate-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Lưu học sinh
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
