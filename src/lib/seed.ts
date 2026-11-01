import { getDb } from "./db";
import { randomUUID } from "crypto";

export function seedDemoData() {
  const db = getDb();
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount && userCount.count > 0) {
    return; // Already seeded
  }

  const teacherId = "teacher-demo-01";
  const classId = "class-12a1";
  const examId = "exam-demo-toan-12";

  // 1. Create Teacher
  db.prepare(`
    INSERT INTO users (id, username, password_hash, name, email, phone, role, school)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    teacherId,
    "giaovien",
    "password123",
    "Thầy Nguyễn Văn Nam",
    "nam.nguyen@edu.vn",
    "0987654321",
    "teacher",
    "THPT Chuyên Hà Nội - Amsterdam"
  );

  // 2. Create Class
  db.prepare(`
    INSERT INTO classes (id, teacher_id, name, grade, school_year, code)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    classId,
    teacherId,
    "12A1 Chuyên Toán",
    "12",
    "2026-2027",
    "12A1HN"
  );

  // 3. Create Sample Students
  const students = [
    { id: "std-01", name: "Trần Minh Anh", code: "SBD001", dob: "2008-05-12", gender: "Nữ" },
    { id: "std-02", name: "Nguyễn Hoàng Bách", code: "SBD002", dob: "2008-11-20", gender: "Nam" },
    { id: "std-03", name: "Phạm Thu Cúc", code: "SBD003", dob: "2008-02-18", gender: "Nữ" },
    { id: "std-04", name: "Lê Đức Dũng", code: "SBD004", dob: "2008-08-09", gender: "Nam" },
    { id: "std-05", name: "Vũ Hải Đăng", code: "SBD005", dob: "2008-04-25", gender: "Nam" },
    { id: "std-06", name: "Đỗ Mai Hương", code: "SBD006", dob: "2008-09-30", gender: "Nữ" },
  ];

  const insertStudent = db.prepare(`
    INSERT INTO students (id, class_id, name, student_code, gender, dob)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const s of students) {
    insertStudent.run(s.id, classId, s.name, s.code, s.gender, s.dob);
  }

  // 4. Create Sample Exam (Kiểm tra 1 tiết Toán 12 - Giải tích & Hình học)
  db.prepare(`
    INSERT INTO exams (
      id, teacher_id, title, description, duration, exam_type, is_published,
      assigned_class_ids, shuffle_questions, shuffle_options, max_attempts,
      allow_view_score, allow_view_answers, anti_cheat_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    examId,
    teacherId,
    "Đề kiểm tra Khảo sát Toán 12 (Chuẩn GDPT 2018)",
    "Đề gồm trắc nghiệm 4 lựa chọn, đúng sai và tự luận. Giám sát chống gian lận Azota Pro.",
    45,
    "test",
    1,
    JSON.stringify([classId]),
    0,
    0,
    2,
    "after_submit",
    1,
    "strict"
  );

  // 5. Create Questions for this exam
  const questions = [
    {
      id: "q-01",
      index: 1,
      type: "single_choice",
      content: "Cho hàm số $y = f(x)$ có bảng biến thiên trên đoạn $[-2; 3]$. Tìm giá trị cực đại $y_{CĐ}$ của hàm số.",
      options: JSON.stringify([
        { id: "A", text: "$y_{CĐ} = 5$" },
        { id: "B", text: "$y_{CĐ} = -2$" },
        { id: "C", text: "$y_{CĐ} = 3$" },
        { id: "D", text: "$y_{CĐ} = 0$" },
      ]),
      correct_answer: "A",
      explanation: "Từ bảng biến thiên, tại điểm $x = 1$, đạo hàm đổi dấu từ dương sang âm nên $y_{CĐ} = f(1) = 5$.",
      score: 1.0,
      cognitive_level: "nhan_biet",
    },
    {
      id: "q-02",
      index: 2,
      type: "single_choice",
      content: "Tính nguyên hàm $\\int (3x^2 + 2x - 1) dx$.",
      options: JSON.stringify([
        { id: "A", text: "$x^3 + x^2 - x + C$" },
        { id: "B", text: "$6x + 2 + C$" },
        { id: "C", text: "$x^3 + 2x^2 - x + C$" },
        { id: "D", text: "$\\frac{x^3}{3} + x^2 - x + C$" },
      ]),
      correct_answer: "A",
      explanation: "Áp dụng công thức nguyên hàm cơ bản: $\\int 3x^2 dx = x^3$, $\\int 2x dx = x^2$, $\\int -1 dx = -x$.",
      score: 1.0,
      cognitive_level: "nhan_biet",
    },
    {
      id: "q-03",
      index: 3,
      type: "true_false",
      content: "Cho hình lăng trụ đứng $ABC.A'B'C'$ có đáy $ABC$ là tam giác vuông tại $A$, $AB = a, AC = a\\sqrt{3}, AA' = 2a$. Xét tính đúng/sai của các mệnh đề sau:",
      options: JSON.stringify([
        { id: "A", text: "Thể tích khối lăng trụ $V = a^3\\sqrt{3}$", is_correct: true },
        { id: "B", text: "Khoảng cách giữa hai đường thẳng $AA'$ và $BC$ bằng $a$", is_correct: false },
        { id: "C", text: "Góc giữa đường thẳng $A'B$ và mặt phẳng $(ABC)$ bằng $60^\\circ$", is_correct: false },
        { id: "D", text: "Diện tích xung quanh của hình lăng trụ bằng $(3 + \\sqrt{3})2a^2$", is_correct: true },
      ]),
      correct_answer: JSON.stringify({ A: true, B: false, C: false, D: true }),
      explanation: "Diện tích đáy $S_{ABC} = \\frac{1}{2} a \\cdot a\\sqrt{3} = \\frac{a^2\\sqrt{3}}{2}$. Chiều cao $h = 2a \\Rightarrow V = S \\cdot h = a^3\\sqrt{3}$.",
      score: 2.0,
      cognitive_level: "van_dung",
    },
    {
      id: "q-04",
      index: 4,
      type: "short_answer",
      content: "Một người gửi tiết kiệm 100 triệu đồng vào ngân hàng với lãi suất 6.5%/năm theo hình thức lãi kép. Hỏi sau đúng 5 năm, số tiền lãi người đó thu được là bao nhiêu triệu đồng? (Làm tròn đến 1 chữ số thập phân).",
      options: "[]",
      correct_answer: "37.0",
      explanation: "Tổng số tiền thu được sau 5 năm: $T = 100 \\times (1 + 0.065)^5 \\approx 137.0$ triệu. Tiền lãi = $137.0 - 100 = 37.0$ triệu.",
      score: 2.0,
      cognitive_level: "van_dung_cao",
    },
    {
      id: "q-05",
      index: 5,
      type: "essay",
      content: "Giải bất phương trình sau và chụp ảnh bài làm chi tiết gửi kèm:\n$$\\log_2(x^2 - 3x + 2) \\le 1$$",
      options: "[]",
      correct_answer: "[0; 1) U (2; 3]",
      explanation: "Điều kiện: $x^2 - 3x + 2 > 0 \\Leftrightarrow x < 1$ hoặc $x > 2$.\nBPT tương đương $x^2 - 3x + 2 \\le 2^1 = 2 \\Leftrightarrow x(x - 3) \\le 0 \\Leftrightarrow 0 \\le x \\le 3$.\nKết hợp điều kiện suy ra tập nghiệm: $S = [0; 1) \\cup (2; 3]$.",
      score: 4.0,
      cognitive_level: "van_dung",
    },
  ];

  const insertQ = db.prepare(`
    INSERT INTO questions (
      id, exam_id, question_index, type, content, options, correct_answer, explanation, score, cognitive_level, subject, grade
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of questions) {
    insertQ.run(
      q.id,
      examId,
      q.index,
      q.type,
      q.content,
      q.options,
      q.correct_answer,
      q.explanation,
      q.score,
      q.cognitive_level,
      "Toán",
      "12"
    );
  }

  // 6. Add to Question Bank
  const insertBank = db.prepare(`
    INSERT INTO question_bank (id, teacher_id, subject, grade, topic, type, content, options, correct_answer, explanation, cognitive_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBank.run(
    "qb-01",
    teacherId,
    "Toán",
    "12",
    "Hàm số",
    "single_choice",
    "Tìm tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$.",
    JSON.stringify([
      { id: "A", text: "$x = -1$" },
      { id: "B", text: "$x = 2$" },
      { id: "C", text: "$y = 2$" },
      { id: "D", text: "$y = -1$" },
    ]),
    "A",
    "Nghiệm của mẫu $x + 1 = 0 \\Leftrightarrow x = -1$.",
    "nhan_biet"
  );
}
