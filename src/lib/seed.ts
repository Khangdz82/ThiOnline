import { getDb } from "./db";
import { randomUUID } from "crypto";

export function seedDemoData() {
  const db = getDb();
  const teacherId = "teacher-demo-01";
  const classId = "class-12a1";
  const examId = "exam-demo-toan-12";

  // 1. Create Teacher
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (!userCount || userCount.count === 0) {
    db.prepare(`
      INSERT INTO users (id, username, password_hash, name, email, phone, role, school, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      teacherId,
      "giaovien",
      "password123",
      "Thầy Nguyễn Văn Nam",
      "nam.nguyen@edu.vn",
      "0987654321",
      "teacher",
      "THPT Chuyên Hà Nội - Amsterdam",
      500
    );
  }

  // 2. Create Class
  const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get() as { count: number };
  if (!classCount || classCount.count === 0) {
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
  }

  // 4. Create Sample Exam
  const examCount = db.prepare("SELECT COUNT(*) as count FROM exams").get() as { count: number };
  if (!examCount || examCount.count === 0) {
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
      "Đề gồm trắc nghiệm 4 lựa chọn, đúng sai và tự luận. Giám sát chống gian lận ThiOnline Pro.",
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
  }

  // 6. Add to Question Bank
  const insertBank = db.prepare(`
    INSERT OR IGNORE INTO question_bank (id, teacher_id, subject, grade, topic, type, content, options, correct_answer, explanation, cognitive_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const bankItems = [
    {
      id: "qb-01",
      subject: "Toán",
      grade: "12",
      topic: "Khảo sát hàm số",
      type: "single_choice",
      content: "Tìm tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$.",
      options: [
        { id: "A", text: "$x = -1$" },
        { id: "B", text: "$x = 2$" },
        { id: "C", text: "$y = 2$" },
        { id: "D", text: "$y = -1$" },
      ],
      correct_answer: "A",
      explanation: "Nghiệm của mẫu $x + 1 = 0 \\Leftrightarrow x = -1$.",
      cognitive_level: "nhan_biet",
    },
    {
      id: "qb-02",
      subject: "Toán",
      grade: "12",
      topic: "Khảo sát hàm số",
      type: "single_choice",
      content: "Cho hàm số $y = x^3 - 3x + 2$. Điểm cực đại của đồ thị hàm số là:",
      options: [
        { id: "A", text: "$M(-1; 4)$" },
        { id: "B", text: "$N(1; 0)$" },
        { id: "C", text: "$P(0; 2)$" },
        { id: "D", text: "$Q(-1; 0)$" },
      ],
      correct_answer: "A",
      explanation: "$y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = -1$, $y = 4$ là điểm cực đại.",
      cognitive_level: "thong_hieu",
    },
    {
      id: "qb-03",
      subject: "Toán",
      grade: "12",
      topic: "Nguyên hàm & Tích phân",
      type: "single_choice",
      content: "Biết $\\int_1^2 f(x)dx = 3$ và $\\int_1^2 g(x)dx = -1$. Giá trị của $\\int_1^2 [3f(x) + 2g(x)]dx$ bằng:",
      options: [
        { id: "A", text: "$7$" },
        { id: "B", text: "$8$" },
        { id: "C", text: "$11$" },
        { id: "D", text: "$5$" },
      ],
      correct_answer: "A",
      explanation: "$I = 3(3) + 2(-1) = 9 - 2 = 7$.",
      cognitive_level: "nhan_biet",
    },
    {
      id: "qb-04",
      subject: "Toán",
      grade: "12",
      topic: "Hình học Oxyz",
      type: "single_choice",
      content: "Trong không gian $Oxyz$, mặt phẳng đi qua điểm $M(1; 2; 3)$ và vuông góc với trục $Oz$ có phương trình là:",
      options: [
        { id: "A", text: "$z - 3 = 0$" },
        { id: "B", text: "$x - 1 = 0$" },
        { id: "C", text: "$y - 2 = 0$" },
        { id: "D", text: "$x + y + z - 6 = 0$" },
      ],
      correct_answer: "A",
      explanation: "Vectơ pháp tuyến là $\\vec{k} = (0; 0; 1)$, đi qua $M(1; 2; 3) \\Rightarrow z - 3 = 0$.",
      cognitive_level: "thong_hieu",
    },
    {
      id: "qb-05",
      subject: "Toán",
      grade: "12",
      topic: "Mũ & Logarit",
      type: "single_choice",
      content: "Nghiệm của phương trình $\\log_2(x - 1) = 3$ là:",
      options: [
        { id: "A", text: "$x = 9$" },
        { id: "B", text: "$x = 10$" },
        { id: "C", text: "$x = 7$" },
        { id: "D", text: "$x = 8$" },
      ],
      correct_answer: "A",
      explanation: "$x - 1 = 2^3 = 8 \\Leftrightarrow x = 9$.",
      cognitive_level: "nhan_biet",
    },
    {
      id: "qb-06",
      subject: "Vật lý",
      grade: "12",
      topic: "Dao động điều hòa",
      type: "single_choice",
      content: "Một chất điểm dao động điều hòa với chu kỳ $T = 0.5\\text{ s}$. Tần số dao động của chất điểm là:",
      options: [
        { id: "A", text: "$2\\text{ Hz}$" },
        { id: "B", text: "$0.5\\text{ Hz}$" },
        { id: "C", text: "$4\\pi\\text{ rad/s}$" },
        { id: "D", text: "$1\\text{ Hz}$" },
      ],
      correct_answer: "A",
      explanation: "$f = \\frac{1}{T} = \\frac{1}{0.5} = 2\\text{ Hz}$.",
      cognitive_level: "nhan_biet",
    },
  ];

  for (const b of bankItems) {
    insertBank.run(
      b.id,
      teacherId,
      b.subject,
      b.grade,
      b.topic,
      b.type,
      b.content,
      JSON.stringify(b.options),
      b.correct_answer,
      b.explanation,
      b.cognitive_level
    );
  }

  // 7. Seed Shared Exams (Kho đề chung ThiOnline)
  const sharedCount = db.prepare("SELECT COUNT(*) as count FROM shared_exams").get() as { count: number };
  if (!sharedCount || sharedCount.count === 0) {
    const insertShared = db.prepare(`
      INSERT INTO shared_exams (id, title, subject, grade, topic, duration, question_count, questions, description, downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sharedExams = [
      {
        id: "shared-toan-12-gdpt",
        title: "Đề thi thử Tốt nghiệp THPT 2026 môn Toán (Chuẩn GDPT 2018)",
        subject: "Toán",
        grade: "12",
        topic: "Khảo sát hàm số, Oxyz, Tích phân & Xác suất",
        duration: 90,
        question_count: 5,
        downloads: 1420,
        description: "Đề thi chuẩn cấu trúc Bộ Giáo dục và Đào tạo mới nhất với đầy đủ các mức độ Nhận biết, Thông hiểu, Vận dụng.",
        questions: [
          {
            index: 1,
            type: "single_choice",
            content: "Cho hàm số $y = f(x)$ có đạo hàm $f'(x) = x(x-1)^2(x+2)$. Số điểm cực trị của hàm số đã cho là:",
            options: [
              { id: "A", text: "$2$" },
              { id: "B", text: "$3$" },
              { id: "C", text: "$1$" },
              { id: "D", text: "$4$" },
            ],
            correct_answer: "A",
            explanation: "$f'(x)$ đổi dấu khi đi qua nghiệm bội lẻ $x = 0$ và $x = -2$. Không đổi dấu qua nghiệm bội chẵn $x = 1$. Do đó có 2 cực trị.",
            score: 2.0,
          },
          {
            index: 2,
            type: "single_choice",
            content: "Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 2z - 4 = 0$. Khoảng cách từ gốc tọa độ $O$ đến mặt phẳng $(P)$ bằng:",
            options: [
              { id: "A", text: "$\\frac{4}{3}$" },
              { id: "B", text: "$4$" },
              { id: "C", text: "$\\frac{4}{9}$" },
              { id: "D", text: "$2$" },
            ],
            correct_answer: "A",
            explanation: "$d(O, (P)) = \\frac{|-4|}{\\sqrt{2^2 + (-1)^2 + 2^2}} = \\frac{4}{3}$.",
            score: 2.0,
          },
          {
            index: 3,
            type: "true_false",
            content: "Cho hình lăng trụ đứng $ABC.A'B'C'$ có đáy $ABC$ là tam giác vuông tại $A$, $AB = a, AC = a\\sqrt{3}, AA' = 2a$. Các mệnh đề sau đúng hay sai?",
            options: [
              { id: "A", text: "Thể tích khối lăng trụ $ABC.A'B'C'$ bằng $a^3\\sqrt{3}$." },
              { id: "B", text: "Đường thẳng $B'C$ tạo với mặt phẳng đáy góc $45^\\circ$." },
              { id: "C", text: "Khoảng cách giữa hai đường thẳng $AA'$ và $BC$ bằng $\\frac{a\\sqrt{3}}{2}$." },
              { id: "D", text: "Bán kính mặt cầu ngoại tiếp khối lăng trụ bằng $a\\sqrt{2}$." },
            ],
            correct_answer: "A:Đúng|B:Đúng|C:Đúng|D:Sai",
            explanation: "$S_{ABC} = \\frac{1}{2} a \\cdot a\\sqrt{3} = \\frac{a^2\\sqrt{3}}{2}$. Thể tích $V = S_{ABC} \\cdot AA' = a^3\\sqrt{3}$.",
            score: 3.0,
          },
          {
            index: 4,
            type: "short_answer",
            content: "Có bao nhiêu số tự nhiên có 4 chữ số đôi một khác nhau được lập từ các chữ số $1, 2, 3, 4, 5, 6, 7$ sao cho số đó chia hết cho 5?",
            options: [],
            correct_answer: "120",
            explanation: "Chữ số tận cùng phải là 5 (1 cách chọn). 3 chữ số còn lại chọn từ 6 chữ số còn lại: $A_6^3 = 120$ số.",
            score: 1.5,
          },
          {
            index: 5,
            type: "essay",
            content: "Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = x^3 - 3mx^2 + 3(m^2 - 1)x - m^3 + m$ có cực đại, cực tiểu đồng thời khoảng cách giữa hai điểm cực trị của đồ thị hàm số bằng $2\\sqrt{5}$.",
            options: [],
            correct_answer: "m = +-1",
            explanation: "$y' = 3(x^2 - 2mx + m^2 - 1) = 0 \\Leftrightarrow x = m \\pm 1$. Khoảng cách hai điểm cực trị $AB = \\sqrt{(2)^2 + (4)^2} = 2\\sqrt{5}$ (thỏa mãn với mọi $m$).",
            score: 1.5,
          },
        ],
      },
      {
        id: "shared-vatly-12",
        title: "Đề kiểm tra 1 tiết Vật lý 12 - Dao động cơ & Sóng cơ",
        subject: "Vật lý",
        grade: "12",
        topic: "Dao động điều hòa, Con lắc đơn, Sóng dừng",
        duration: 45,
        question_count: 4,
        downloads: 875,
        description: "Đề thi phân hóa rõ rệt, bám sát ma trận kiểm tra định kỳ môn Vật lý THPT.",
        questions: [
          {
            index: 1,
            type: "single_choice",
            content: "Một con lắc lò xo có độ cứng $k = 100\\text{ N/m}$, gắn vật nặng khối lượng $m = 100\\text{ g}$. Chu kỳ dao động riêng của con lắc là:",
            options: [
              { id: "A", text: "$0.2\\text{ s}$" },
              { id: "B", text: "$0.02\\text{ s}$" },
              { id: "C", text: "$2\\text{ s}$" },
              { id: "D", text: "$0.628\\text{ s}$" },
            ],
            correct_answer: "A",
            explanation: "$T = 2\\pi \\sqrt{\\frac{m}{k}} = 2\\pi \\sqrt{\\frac{0.1}{100}} = \\frac{2\\pi}{10\\sqrt{10}} \\approx 0.2\\text{ s}$ (lấy $\\pi \\approx \\sqrt{10}$).",
            score: 2.5,
          },
          {
            index: 2,
            type: "single_choice",
            content: "Trên một sợi dây đàn hồi dài $1.2\\text{ m}$, hai đầu cố định, đang có sóng dừng với 3 bụng sóng. Bước sóng $\\lambda$ trên dây là:",
            options: [
              { id: "A", text: "$0.8\\text{ m}$" },
              { id: "B", text: "$0.4\\text{ m}$" },
              { id: "C", text: "$1.2\\text{ m}$" },
              { id: "D", text: "$2.4\\text{ m}$" },
            ],
            correct_answer: "A",
            explanation: "$L = k \\frac{\\lambda}{2} \\Leftrightarrow 1.2 = 3 \\frac{\\lambda}{2} \\Rightarrow \\lambda = 0.8\\text{ m}$.",
            score: 2.5,
          },
          {
            index: 3,
            type: "single_choice",
            content: "Giao thoa sóng trên mặt nước với hai nguồn kết hợp cùng pha $S_1, S_2$. Điểm $M$ trên mặt nước cách hai nguồn lần lượt là $d_1 = 18\\text{ cm}, d_2 = 24\\text{ cm}$. Biết bước sóng $\\lambda = 2\\text{ cm}$. Điểm $M$ nằm trên vân giao thoa:",
            options: [
              { id: "A", text: "Cực đại bậc 3" },
              { id: "B", text: "Cực tiểu thứ 3" },
              { id: "C", text: "Cực đại bậc 4" },
              { id: "D", text: "Cực tiểu thứ 4" },
            ],
            correct_answer: "A",
            explanation: "$d_2 - d_1 = 24 - 18 = 6\\text{ cm} = 3\\lambda$. Do hai nguồn cùng pha nên $M$ thuộc vân cực đại bậc 3.",
            score: 2.5,
          },
          {
            index: 4,
            type: "essay",
            content: "Một vật dao động điều hòa với biên độ $A = 6\\text{ cm}$ và chu kỳ $T = 1\\text{ s}$. Tại thời điểm $t_1$, vật có li độ $x_1 = 3\\text{ cm}$ và đang chuyển động theo chiều dương. Tính quãng đường vật đi được từ thời điểm $t_1$ đến thời điểm $t_2 = t_1 + 1.25\\text{ s}$.",
            options: [],
            correct_answer: "30 cm",
            explanation: "Khoảng thời gian $\\Delta t = 1.25\\text{ s} = T + \\frac{T}{4}$. Sau $1T$, quãng đường là $4A = 24\\text{ cm}$. Trong $\\frac{T}{4}$ tiếp theo từ $x = 3$ theo chiều dương, vật đến biên $A=6$ rồi quay về $x=3\\sqrt{3}$. Tổng quãng đường $S = 24 + (6 - 3) + (6 - 3\\sqrt{3}) \\approx 27.8\\text{ cm}$.",
            score: 2.5,
          },
        ],
      },
      {
        id: "shared-tienganh-12",
        title: "Đề kiểm tra giữa kỳ Tiếng Anh 12 - Ngữ pháp & Đọc hiểu",
        subject: "Tiếng Anh",
        grade: "12",
        topic: "Conditional Sentences, Relative Clauses, Reading Comprehension",
        duration: 45,
        question_count: 4,
        downloads: 650,
        description: "Đề khảo sát chuẩn trắc nghiệm THPT Quốc Gia môn Tiếng Anh.",
        questions: [
          {
            index: 1,
            type: "single_choice",
            content: "The woman _______ car was stolen yesterday called the local police immediately.",
            options: [
              { id: "A", text: "whose" },
              { id: "B", text: "whom" },
              { id: "C", text: "which" },
              { id: "D", text: "who" },
            ],
            correct_answer: "A",
            explanation: "Đại từ quan hệ chỉ sở hữu đứng trước danh từ 'car' là 'whose'.",
            score: 2.5,
          },
          {
            index: 2,
            type: "single_choice",
            content: "If she _______ more time, she would travel around Southeast Asia.",
            options: [
              { id: "A", text: "had" },
              { id: "B", text: "has" },
              { id: "C", text: "would have" },
              { id: "D", text: "had had" },
            ],
            correct_answer: "A",
            explanation: "Câu điều kiện loại 2 giả định điều không có thật ở hiện tại: If + S + V2/ed, S + would + V-inf.",
            score: 2.5,
          },
          {
            index: 3,
            type: "single_choice",
            content: "Mark the letter A, B, C, or D to indicate the word that differs from the other three in the position of primary stress:",
            options: [
              { id: "A", text: "education" },
              { id: "B", text: "university" },
              { id: "C", text: "independent" },
              { id: "D", text: "curriculum" },
            ],
            correct_answer: "D",
            explanation: "Curriculum trọng âm rơi vào âm tiết thứ hai /kəˈrɪkjələm/, các từ còn lại rơi vào âm tiết thứ ba.",
            score: 2.5,
          },
          {
            index: 4,
            type: "single_choice",
            content: "By the time we arrived at the airport, the flight _______ off.",
            options: [
              { id: "A", text: "had taken" },
              { id: "B", text: "took" },
              { id: "C", text: "has taken" },
              { id: "D", text: "was taking" },
            ],
            correct_answer: "A",
            explanation: "Cấu trúc: By the time + quá khứ đơn, quá khứ hoàn thành (hành động xảy ra trước hành động khác trong quá khứ).",
            score: 2.5,
          },
        ],
      },
    ];

    for (const ex of sharedExams) {
      insertShared.run(
        ex.id,
        ex.title,
        ex.subject,
        ex.grade,
        ex.topic,
        ex.duration,
        ex.question_count,
        JSON.stringify(ex.questions),
        ex.description,
        ex.downloads
      );
    }
  }
}
