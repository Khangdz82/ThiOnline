import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";

export async function GET() {
  try {
    seedDemoData();
    const db = getDb();

    const totalExams = (db.prepare("SELECT COUNT(*) as c FROM exams").get() as any).c;
    const totalClasses = (db.prepare("SELECT COUNT(*) as c FROM classes").get() as any).c;
    const totalStudents = (db.prepare("SELECT COUNT(*) as c FROM students").get() as any).c;
    const totalSubmissions = (db.prepare("SELECT COUNT(*) as c FROM submissions").get() as any).c;

    const recentSubmissions = db
      .prepare(`
        SELECT s.id, s.student_name, s.student_code, s.class_name, s.score, s.submitted_at, s.status, e.title as exam_title
        FROM submissions s
        JOIN exams e ON s.exam_id = e.id
        ORDER BY s.submitted_at DESC
        LIMIT 6
      `)
      .all();

    const recentExams = db
      .prepare(`
        SELECT e.*, 
          (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count,
          (SELECT COUNT(*) FROM submissions s WHERE s.exam_id = e.id) as submission_count
        FROM exams e
        ORDER BY e.created_at DESC
        LIMIT 5
      `)
      .all();

    return NextResponse.json({
      success: true,
      stats: {
        totalExams,
        totalClasses,
        totalStudents,
        totalSubmissions,
      },
      recentSubmissions,
      recentExams,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
