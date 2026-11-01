import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  try {
    seedDemoData();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const grade = searchParams.get("grade");
    const level = searchParams.get("level");
    const q = searchParams.get("q");

    const db = getDb();
    let query = "SELECT * FROM question_bank WHERE 1=1";
    const params: any[] = [];

    if (subject) {
      query += " AND subject = ?";
      params.push(subject);
    }
    if (grade) {
      query += " AND grade = ?";
      params.push(grade);
    }
    if (level) {
      query += " AND cognitive_level = ?";
      params.push(level);
    }
    if (q) {
      query += " AND content LIKE ?";
      params.push(`%${q}%`);
    }

    query += " ORDER BY created_at DESC LIMIT 100";

    const rows = db.prepare(query).all(...params) as any[];
    const questions = rows.map((r) => ({
      ...r,
      options: JSON.parse(r.options || "[]"),
    }));

    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    const {
      subject = "Toán",
      grade = "12",
      topic = "Tổng hợp",
      type = "single_choice",
      content,
      options = [],
      correct_answer = "",
      explanation = "",
      cognitive_level = "thong_hieu",
    } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: "Nội dung câu hỏi bắt buộc" }, { status: 400 });
    }

    const qbId = "qb-" + randomUUID().slice(0, 8);
    const teacherId = "teacher-demo-01";

    db.prepare(`
      INSERT INTO question_bank (
        id, teacher_id, subject, grade, topic, type, content, options, correct_answer, explanation, cognitive_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      qbId,
      teacherId,
      subject,
      grade,
      topic,
      type,
      content,
      typeof options === "string" ? options : JSON.stringify(options),
      correct_answer,
      explanation,
      cognitive_level
    );

    return NextResponse.json({ success: true, qbId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
