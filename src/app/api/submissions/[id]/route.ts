import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id) as any;
    if (!submission) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài làm" }, { status: 404 });
    }

    const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(submission.exam_id) as any;
    const questions = db
      .prepare("SELECT * FROM questions WHERE exam_id = ? ORDER BY question_index ASC")
      .all(submission.exam_id) as any[];

    const violations = db
      .prepare("SELECT * FROM violations WHERE submission_id = ? ORDER BY occurred_at DESC")
      .all(id);

    return NextResponse.json({
      success: true,
      submission: {
        ...submission,
        answers: JSON.parse(submission.answers || "{}"),
        essay_annotations: JSON.parse(submission.essay_annotations || "[]"),
      },
      exam,
      questions: questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options || "[]"),
      })),
      violations,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      score,
      answers,
      teacher_feedback = "",
      essay_annotations = [],
    } = body;

    const db = getDb();
    if (answers) {
      db.prepare(`
        UPDATE submissions
        SET score = ?, answers = ?, teacher_feedback = ?, essay_annotations = ?, status = 'graded', graded_at = datetime('now')
        WHERE id = ?
      `).run(
        score,
        JSON.stringify(answers),
        teacher_feedback,
        JSON.stringify(essay_annotations),
        id
      );
    } else {
      db.prepare(`
        UPDATE submissions
        SET score = ?, teacher_feedback = ?, essay_annotations = ?, status = 'graded', graded_at = datetime('now')
        WHERE id = ?
      `).run(
        score,
        teacher_feedback,
        JSON.stringify(essay_annotations),
        id
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
