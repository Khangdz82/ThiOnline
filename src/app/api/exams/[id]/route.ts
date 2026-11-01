import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    seedDemoData();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "teacher";

    const db = getDb();
    const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(id) as any;

    if (!exam) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đề thi" }, { status: 404 });
    }

    const rawQuestions = db
      .prepare("SELECT * FROM questions WHERE exam_id = ? ORDER BY question_index ASC")
      .all(id) as any[];

    const questions = rawQuestions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(q.options || "[]");
      } catch {
        parsedOptions = [];
      }

      // If student in exam mode, do not leak correct answer & explanation
      if (role === "student") {
        return {
          id: q.id,
          question_index: q.question_index,
          type: q.type,
          content: q.content,
          options: parsedOptions.map((opt: any) => ({ id: opt.id, text: opt.text })),
          score: q.score,
        };
      }

      return {
        ...q,
        options: parsedOptions,
      };
    });

    // Submissions for this exam
    const submissions = db
      .prepare(`
        SELECT s.*, 
          (SELECT COUNT(*) FROM violations v WHERE v.submission_id = s.id) as violation_count
        FROM submissions s 
        WHERE s.exam_id = ? 
        ORDER BY s.submitted_at DESC
      `)
      .all(id);

    return NextResponse.json({
      success: true,
      exam,
      questions,
      submissions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare("DELETE FROM exams WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
