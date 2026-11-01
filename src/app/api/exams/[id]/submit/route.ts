import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    const body = await req.json();

    const {
      student_name,
      student_code = "",
      class_name = "",
      answers = {}, // { [questionId]: { chosen: 'A', essay_text?: string, images?: string[] } }
      duration_seconds = 0,
    } = body;

    if (!student_name) {
      return NextResponse.json({ success: false, error: "Họ và tên học sinh là bắt buộc" }, { status: 400 });
    }

    const db = getDb();
    const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(examId) as any;
    if (!exam) {
      return NextResponse.json({ success: false, error: "Đề thi không tồn tại" }, { status: 404 });
    }

    const questions = db
      .prepare("SELECT * FROM questions WHERE exam_id = ? ORDER BY question_index ASC")
      .all(examId) as any[];

    let autoGradedScore = 0;
    let totalExamScore = 0;
    let hasEssay = false;

    for (const q of questions) {
      const qScore = Number(q.score) || 1.0;
      totalExamScore += qScore;
      const studentAns = answers[q.id];

      if (!studentAns) continue;

      if (q.type === "single_choice") {
        if (studentAns.chosen && studentAns.chosen.toUpperCase() === q.correct_answer?.toUpperCase()) {
          autoGradedScore += qScore;
        }
      } else if (q.type === "short_answer") {
        const studentText = (studentAns.chosen || "").trim().toLowerCase();
        const expected = (q.correct_answer || "").trim().toLowerCase();
        if (studentText && studentText === expected) {
          autoGradedScore += qScore;
        }
      } else if (q.type === "true_false") {
        // True/False format with options { A: true, B: false }
        let correctMap: Record<string, boolean> = {};
        try {
          correctMap = JSON.parse(q.correct_answer || "{}");
        } catch {
          correctMap = {};
        }

        const chosenMap = studentAns.chosen || {};
        let correctCount = 0;
        const totalItems = Object.keys(correctMap).length || 4;

        for (const key of Object.keys(correctMap)) {
          if (chosenMap[key] === correctMap[key]) {
            correctCount++;
          }
        }

        // Standard 2018 Ministry scoring or proportional
        if (totalItems > 0) {
          autoGradedScore += +((correctCount / totalItems) * qScore).toFixed(2);
        }
      } else if (q.type === "essay") {
        hasEssay = true;
      }
    }

    // Round to 2 decimal places
    autoGradedScore = Math.min(10, Math.round(autoGradedScore * 100) / 100);

    const submissionId = "sub-" + randomUUID().slice(0, 8);
    const status = hasEssay ? "submitted" : "graded";

    db.prepare(`
      INSERT INTO submissions (
        id, exam_id, student_name, student_code, class_name, answers,
        score, total_score, status, started_at, submitted_at, duration_seconds, graded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${Math.floor(duration_seconds)} seconds'), datetime('now'), ?, ?)
    `).run(
      submissionId,
      examId,
      student_name,
      student_code,
      class_name,
      JSON.stringify(answers),
      autoGradedScore,
      10, // standardized out of 10
      status,
      duration_seconds,
      hasEssay ? null : new Date().toISOString()
    );

    return NextResponse.json({
      success: true,
      submissionId,
      score: autoGradedScore,
      status,
      allowViewScore: exam.allow_view_score,
      allowViewAnswers: exam.allow_view_answers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
