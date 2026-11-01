import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const db = getDb();

    const students = db
      .prepare("SELECT * FROM students WHERE class_id = ? ORDER BY student_code ASC, name ASC")
      .all(classId);

    const cls = db.prepare("SELECT * FROM classes WHERE id = ?").get(classId);

    return NextResponse.json({ success: true, class: cls, students });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const body = await req.json();
    const db = getDb();

    // Check if batch import or single student
    if (Array.isArray(body.students)) {
      const insert = db.prepare(`
        INSERT INTO students (id, class_id, name, student_code, gender, dob, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((list: any[]) => {
        for (const s of list) {
          insert.run(
            "std-" + randomUUID().slice(0, 8),
            classId,
            s.name,
            s.student_code || s.code || "",
            s.gender || "",
            s.dob || "",
            s.phone || ""
          );
        }
      });

      insertMany(body.students);
      return NextResponse.json({ success: true, count: body.students.length });
    }

    const { name, student_code = "", gender = "", dob = "", phone = "" } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Tên học sinh không được để trống" }, { status: 400 });
    }

    const studentId = "std-" + randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO students (id, class_id, name, student_code, gender, dob, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(studentId, classId, name, student_code, gender, dob, phone);

    return NextResponse.json({ success: true, studentId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
