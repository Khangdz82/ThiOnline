import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    seedDemoData();
    const db = getDb();
    const exams = db.prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count,
        (SELECT COUNT(*) FROM submissions s WHERE s.exam_id = e.id) as submission_count
      FROM exams e
      ORDER BY e.created_at DESC
    `).all();

    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    const {
      title,
      description = "",
      subject = "Toán",
      grade = "12",
      duration = 45,
      exam_type = "test",
      password = "",
      is_published = 1,
      target_mode = "public",
      assigned_class_ids = [],
      shuffle_questions = 0,
      shuffle_options = 0,
      max_attempts = 1,
      allow_view_score = "after_submit",
      allow_view_answers = 1,
      anti_cheat_level = "basic",
      start_time = null,
      end_time = null,
      questions = [],
    } = body;

    if (!title || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề và danh sách câu hỏi không được để trống" },
        { status: 400 }
      );
    }

    const examId = "exam-" + randomUUID().slice(0, 8);
    const teacherId = "teacher-demo-01";

    const insertExam = db.prepare(`
      INSERT INTO exams (
        id, teacher_id, title, description, duration, exam_type, password,
        is_published, assigned_class_ids, shuffle_questions, shuffle_options,
        max_attempts, allow_view_score, allow_view_answers, anti_cheat_level,
        start_time, end_time, target_mode, subject, grade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertExam.run(
      examId,
      teacherId,
      title,
      description,
      duration,
      exam_type,
      password,
      is_published,
      JSON.stringify(assigned_class_ids),
      shuffle_questions ? 1 : 0,
      shuffle_options ? 1 : 0,
      max_attempts,
      allow_view_score,
      allow_view_answers ? 1 : 0,
      anti_cheat_level,
      start_time,
      end_time,
      target_mode,
      subject,
      grade
    );

    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, exam_id, question_index, type, content, options, correct_answer, explanation, score, cognitive_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const totalQuestions = questions.length;
    const defaultPointsPerQ = +(10 / totalQuestions).toFixed(2);

    questions.forEach((q: any, idx: number) => {
      const qId = "q-" + randomUUID().slice(0, 8);
      insertQ.run(
        qId,
        examId,
        idx + 1,
        q.type || "single_choice",
        q.content,
        typeof q.options === "string" ? q.options : JSON.stringify(q.options || []),
        q.correct_answer || "",
        q.explanation || "",
        q.score || defaultPointsPerQ,
        q.cognitive_level || "thong_hieu"
      );
    });

    return NextResponse.json({ success: true, examId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
