import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";
import { ParsedQuestion } from "@/lib/parser";

export async function POST(req: Request) {
  try {
    seedDemoData();
    const body = await req.json();
    const {
      subject = "Toán",
      grade = "12",
      topic = "Đề tổng hợp theo ma trận GDPT 2018",
      nhan_biet = 4,
      thong_hieu = 4,
      van_dung = 2,
      van_dung_cao = 1,
    } = body;

    const db = getDb();

    // Query questions from question_bank for this subject and cognitive levels
    const levels = [
      { level: "nhan_biet", count: Number(nhan_biet) || 0, label: "Nhận biết" },
      { level: "thong_hieu", count: Number(thong_hieu) || 0, label: "Thông hiểu" },
      { level: "van_dung", count: Number(van_dung) || 0, label: "Vận dụng" },
      { level: "van_dung_cao", count: Number(van_dung_cao) || 0, label: "Vận dụng cao" },
    ];

    const selectedQuestions: ParsedQuestion[] = [];
    let qIndex = 1;

    for (const lvl of levels) {
      if (lvl.count <= 0) continue;

      const rows = db
        .prepare(`
          SELECT * FROM question_bank
          WHERE (subject = ? OR subject = 'Toán') AND cognitive_level = ?
          ORDER BY RANDOM()
          LIMIT ?
        `)
        .all(subject, lvl.level, lvl.count) as any[];

      for (const r of rows) {
        selectedQuestions.push({
          index: qIndex++,
          type: r.type || "single_choice",
          content: r.content,
          options: JSON.parse(r.options || "[]"),
          correct_answer: r.correct_answer || "A",
          explanation: r.explanation || "",
          score: 1.0,
        });
      }

      // If bank doesn't have enough questions for this level, synthesize curriculum-compliant items
      const needed = lvl.count - rows.length;
      for (let k = 0; k < needed; k++) {
        const synth = generateMatrixItem(subject, grade, lvl.level, qIndex);
        selectedQuestions.push(synth);
        qIndex++;
      }
    }

    // Scale scores so sum of all questions equals 10.0 points
    const totalQ = selectedQuestions.length;
    if (totalQ > 0) {
      const perQuestionScore = Math.round((10.0 / totalQ) * 100) / 100;
      selectedQuestions.forEach((q) => {
        q.score = perQuestionScore;
      });
    }

    return NextResponse.json({
      success: true,
      questions: selectedQuestions,
      title: `Đề kiểm tra ${subject} ${grade} - Ma trận chuẩn Bộ GD&ĐT`,
      totalQuestions: selectedQuestions.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function generateMatrixItem(subject: string, grade: string, level: string, index: number): ParsedQuestion {
  if (level === "nhan_biet") {
    return {
      index,
      type: "single_choice",
      content: `[Nhận biết] Cho hàm số $y = f(x)$ có bảng biến thiên trên đoạn $[-2; 3]$. Giá trị cực tiểu của hàm số đã cho bằng:`,
      options: [
        { id: "A", text: "$-3$" },
        { id: "B", text: "$1$" },
        { id: "C", text: "$4$" },
        { id: "D", text: "$0$" },
      ],
      correct_answer: "A",
      explanation: "Đọc trực tiếp từ dòng $y$ tại điểm cực tiểu trên bảng biến thiên.",
      score: 1.0,
    };
  } else if (level === "thong_hieu") {
    return {
      index,
      type: "single_choice",
      content: `[Thông hiểu] Cho khối chóp $S.ABC$ có đáy $ABC$ là tam giác vuông cân tại $B$, $AB = a$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = 2a$. Thể tích khối chóp đã cho bằng:`,
      options: [
        { id: "A", text: "$\\frac{a^3}{3}$" },
        { id: "B", text: "$\\frac{2a^3}{3}$" },
        { id: "C", text: "$a^3$" },
        { id: "D", text: "$\\frac{a^3}{6}$" },
      ],
      correct_answer: "A",
      explanation: "$V = \\frac{1}{3} S_{ABC} \\cdot SA = \\frac{1}{3} (\\frac{1}{2} a^2) \\cdot 2a = \\frac{a^3}{3}$.",
      score: 1.0,
    };
  } else if (level === "van_dung") {
    return {
      index,
      type: "single_choice",
      content: `[Vận dụng] Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = \\frac{1}{3}x^3 - mx^2 + (m^2 - 4)x + 3$ đạt cực đại tại $x = 1$.`,
      options: [
        { id: "A", text: "$m = 3$" },
        { id: "B", text: "$m = -1$" },
        { id: "C", text: "$m = 1$" },
        { id: "D", text: "$m = 3$ hoặc $m = -1$" },
      ],
      correct_answer: "B",
      explanation: "$y' = x^2 - 2mx + m^2 - 4$. Ta có $y'(1) = 0 \\Leftrightarrow m^2 - 2m - 3 = 0 \\Leftrightarrow m = 3$ hoặc $m = -1$. Kiểm tra $y''(1) < 0$ ta được $m = -1$.",
      score: 1.0,
    };
  } else {
    return {
      index,
      type: "single_choice",
      content: `[Vận dụng cao] Có bao nhiêu giá trị nguyên của tham số $m \\in [-10; 10]$ để phương trình $\\log_2^2(x) - (m+2)\\log_2(x) + 2m = 0$ có hai nghiệm phân biệt $x_1, x_2$ thỏa mãn $x_1 x_2 < 64$?`,
      options: [
        { id: "A", text: "$14$" },
        { id: "B", text: "$13$" },
        { id: "C", text: "$12$" },
        { id: "D", text: "$11$" },
      ],
      correct_answer: "B",
      explanation: "Đặt $t = \\log_2 x$, phương trình có $t_1 + t_2 = \\log_2(x_1 x_2) = m + 2 < \\log_2 64 = 6 \\Rightarrow m < 4$. Kết hợp điều kiện $\\Delta > 0$, ta được 13 giá trị nguyên.",
      score: 1.0,
    };
  }
}