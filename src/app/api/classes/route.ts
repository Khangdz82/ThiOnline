import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    seedDemoData();
    const db = getDb();
    const classes = db.prepare(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
      FROM classes c
      ORDER BY c.created_at DESC
    `).all();

    return NextResponse.json({ success: true, classes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const { name, grade = "12", school_year = "2026-2027" } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Tên lớp không được để trống" }, { status: 400 });
    }

    const classId = "class-" + randomUUID().slice(0, 8);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const teacherId = "teacher-demo-01";

    db.prepare(`
      INSERT INTO classes (id, teacher_id, name, grade, school_year, code)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(classId, teacherId, name, grade, school_year, code);

    return NextResponse.json({ success: true, classId, code });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
