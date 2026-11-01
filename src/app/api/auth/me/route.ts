import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";

export async function GET(req: Request) {
  try {
    seedDemoData();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "teacher-demo-01";

    const db = getDb();
    const user = db
      .prepare(`
        SELECT id, username, name, email, phone, role, school, COALESCE(points, 500) as points
        FROM users
        WHERE id = ?
      `)
      .get(userId) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "Người dùng không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Support claiming bonus points (e.g. +100 Points demo)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId || "teacher-demo-01";
    const amount = Number(body.amount) || 100;

    const db = getDb();
    db.prepare("UPDATE users SET points = COALESCE(points, 500) + ? WHERE id = ?").run(amount, userId);

    const updated = db.prepare("SELECT id, points FROM users WHERE id = ?").get(userId) as any;
    return NextResponse.json({ success: true, points: updated.points, message: `Đã nạp thành công +${amount} Point!` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}