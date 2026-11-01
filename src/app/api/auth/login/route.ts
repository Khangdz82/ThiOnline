import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";

export async function POST(req: Request) {
  try {
    seedDemoData();
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập tài khoản và mật khẩu" }, { status: 400 });
    }

    const db = getDb();
    const user = db
      .prepare(`
        SELECT id, username, name, email, phone, role, school
        FROM users
        WHERE (username = ? OR email = ? OR phone = ?) AND password_hash = ?
      `)
      .get(username, username, username, password) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Tài khoản hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
