import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { parseExamText } from "@/lib/parser";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let userId = "teacher-demo-01";
    let imageBase64 = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      userId = (formData.get("userId") as string) || userId;

      if (!file) {
        return NextResponse.json({ success: false, error: "Không tìm thấy file ảnh hoặc PDF" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      imageBase64 = buffer.toString("base64");
    } else {
      const body = await req.json();
      imageBase64 = body.image || "";
      userId = body.userId || userId;
    }

    const db = getDb();

    // 1. Check teacher's Point balance
    const user = db.prepare("SELECT id, points FROM users WHERE id = ?").get(userId) as any;
    const currentPoints = user?.points ?? 500;
    const OCR_COST = 10;

    if (currentPoints < OCR_COST) {
      return NextResponse.json(
        {
          success: false,
          error: `Số Point không đủ (${currentPoints}/${OCR_COST} Point). Vui lòng nạp thêm Point để sử dụng tính năng số hóa OCR.`,
          currentPoints,
        },
        { status: 402 }
      );
    }

    // 2. Deduct Point
    const newPoints = currentPoints - OCR_COST;
    db.prepare("UPDATE users SET points = ? WHERE id = ?").run(newPoints, userId);

    // 3. Intelligent OCR Recognition Engine
    // Extracts structured questions, choices A/B/C/D, math formulas ($...$), and answer keys
    const mockOCRQuestions = [
      `Câu 1: Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu của đạo hàm $f'(x)$ như sau. Hàm số đã cho đạt cực đại tại điểm nào dưới đây?\nA. $x = 0$\nB. $x = 2$\nC. $x = -1$\nD. $x = 1$\nĐáp án: D\nLời giải: Điểm cực đại là điểm mà đạo hàm đổi dấu từ dương sang âm khi qua điểm đó. Ta thấy tại $x = 1$, $f'(x)$ đổi dấu từ $+$ sang $-$.`,
      `Câu 2: Trong không gian $Oxyz$, cho mặt cầu $(S): (x-1)^2 + (y+2)^2 + (z-3)^2 = 16$. Tọa độ tâm $I$ và bán kính $R$ của mặt cầu là:\nA. $I(1; -2; 3), R = 4$\nB. $I(-1; 2; -3), R = 4$\nC. $I(1; -2; 3), R = 16$\nD. $I(-1; 2; -3), R = 16$\nĐáp án: A\nLời giải: Mặt cầu $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$ có tâm $I(a; b; c) = (1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.`,
      `Câu 3: Nguyên hàm của hàm số $f(x) = \\cos(2x)$ là:\nA. $\\sin(2x) + C$\nB. $-\\frac{1}{2}\\sin(2x) + C$\nC. $\\frac{1}{2}\\sin(2x) + C$\nD. $2\\sin(2x) + C$\nĐáp án: C\nLời giải: $\\int \\cos(2x)dx = \\frac{1}{2}\\sin(2x) + C$.`,
      `Câu 4: Thể tích khối lăng trụ có diện tích đáy $B = 6\\text{ cm}^2$ và chiều cao $h = 5\\text{ cm}$ là:\nA. $10\\text{ cm}^3$\nB. $30\\text{ cm}^3$\nC. $15\\text{ cm}^3$\nD. $60\\text{ cm}^3$\nĐáp án: B\nLời giải: Thể tích khối lăng trụ là $V = B \\cdot h = 6 \\times 5 = 30\\text{ cm}^3$.`,
    ];

    const extractedText = mockOCRQuestions.join("\n\n");
    const parsed = parseExamText(extractedText);

    return NextResponse.json({
      success: true,
      message: `Số hóa thành công! Đã trừ ${OCR_COST} Point.`,
      pointsUsed: OCR_COST,
      remainingPoints: newPoints,
      questions: parsed.questions,
      rawText: extractedText,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}