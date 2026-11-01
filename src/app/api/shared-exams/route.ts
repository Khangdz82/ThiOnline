import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";

export async function GET(req: Request) {
  try {
    seedDemoData();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const grade = searchParams.get("grade");

    const db = getDb();
    let query = "SELECT * FROM shared_exams WHERE 1=1";
    const params: any[] = [];

    if (subject && subject !== "Tất cả") {
      query += " AND subject = ?";
      params.push(subject);
    }
    if (grade && grade !== "Tất cả") {
      query += " AND grade = ?";
      params.push(grade);
    }

    query += " ORDER BY downloads DESC, created_at DESC";

    const rows = db.prepare(query).all(...params) as any[];
    const exams = rows.map((r) => ({
      ...r,
      questions: JSON.parse(r.questions || "[]"),
    }));

    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}