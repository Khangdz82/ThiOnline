"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useToast } from "@/components/Toast";
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

function formatGrade(grade: any) {
  if (!grade) return "";
  const s = String(grade).trim();
  if (/^\d+$/.test(s)) return `Khối ${s}`;
  return s;
}

export default function ClassesPage() {
  const toast = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New class modal / form
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("12");
  const [deleteConfirmClass, setDeleteConfirmClass] = useState<any>(null);

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
        toast.success(`Đã tạo lớp ${newClassName} thành công!`);
        await fetchClasses();
      }
    } catch (e) {
      toast.error("Lỗi tạo lớp học");
    }
  };

  const handleDeleteClass = async (cls: any) => {
    if (!cls) return;
    try {
      const res = await fetch(`/api/classes/${cls.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Đã xóa lớp "${cls.name}" thành công!`);
        setDeleteConfirmClass(null);
        if (selectedClass?.id === cls.id) {
          setSelectedClass(null);
          setStudents([]);
        }
        await fetchClasses();
      } else {
        toast.error(json.error || "Không thể xóa lớp");
      }
    } catch {
      toast.error("Lỗi khi kết nối xóa lớp học");
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
        toast.success(`Đã thêm học sinh ${studentName}!`);
        selectClass(selectedClass);
      }
    } catch (e) {
      toast.error("Lỗi thêm học sinh");
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
            toast.success(`Đã import thành công ${json.count} học sinh vào lớp!`);
            selectClass(selectedClass);
          }
        }
      } catch (err) {
        toast.error("Lỗi đọc file Excel: Kiểm tra các cột Họ và tên, SBD, Giới tính, Ngày sinh.");
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
          className="btn btn-primary px-4 py-2.5 text-sm"
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
              <div
                key={cls.id}
                onClick={() => selectClass(cls)}
                role="button"
                className={`w-full flex items-center justify-between rounded-xl p-3.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                  selectedClass?.id === cls.id
                    ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20"
                    : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
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
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      selectedClass?.id === cls.id
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {cls.student_count || 0} HS
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmClass(cls);
                    }}
                    title="Xóa lớp học"
                    className={`rounded-lg p-1 transition-colors ${
                      selectedClass?.id === cls.id
                        ? "text-emerald-200 hover:bg-emerald-700 hover:text-white"
                        : "text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
                    {selectedClass.name} ({formatGrade(selectedClass.grade)})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mã mời tham gia: <strong className="text-emerald-600">{selectedClass.code}</strong> • Sĩ số: {students.length} học sinh
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="btn btn-secondary px-3.5 py-2 text-xs">
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
                    className="btn btn-primary px-3.5 py-2 text-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Thêm học sinh</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmClass(selectedClass)}
                    className="btn btn-ghost px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    title="Xóa lớp học này"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa lớp</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateClass} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Khối lớp / Trình độ</label>
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <optgroup label="Cấp 3 - THPT">
                  <option value="12">Khối 12</option>
                  <option value="11">Khối 11</option>
                  <option value="10">Khối 10</option>
                </optgroup>
                <optgroup label="Cấp 2 - THCS">
                  <option value="9">Khối 9</option>
                  <option value="8">Khối 8</option>
                  <option value="7">Khối 7</option>
                  <option value="6">Khối 6</option>
                </optgroup>
                <optgroup label="Cấp 1 - Tiểu học">
                  <option value="5">Khối 5</option>
                  <option value="4">Khối 4</option>
                  <option value="3">Khối 3</option>
                  <option value="2">Khối 2</option>
                  <option value="1">Khối 1</option>
                </optgroup>
                <optgroup label="Đại học & Đào tạo chuyên sâu">
                  <option value="Đại học">Đại học / Cao đẳng</option>
                  <option value="Luyện thi">Luyện thi ĐGNL / Tốt nghiệp</option>
                  <option value="Trung tâm">Trung tâm Ngoại ngữ / Tin học</option>
                  <option value="Khác">Khối khác</option>
                </optgroup>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewClass(false)}
                className="btn btn-ghost px-4 py-2 text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 py-2 text-sm"
              >
                Tạo lớp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {showNewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddStudent} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
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
                  <option value="Khác">Khác</option>
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
                className="btn btn-ghost px-4 py-2 text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 py-2 text-sm"
              >
                Lưu học sinh
              </button>
            </div>
          </form>
        </div>
      )}
      {/* MODAL: DELETE CLASS CONFIRMATION */}
      {deleteConfirmClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Xác nhận xóa lớp?</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa lớp <strong className="text-slate-900 dark:text-white">{deleteConfirmClass.name}</strong> cùng toàn bộ danh sách học sinh thuộc lớp này?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmClass(null)}
                className="btn btn-secondary px-4 py-2 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClass(deleteConfirmClass)}
                className="btn bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 text-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
