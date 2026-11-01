import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoData } from "@/lib/seed";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    seedDemoData();
    const body = await req.json();
    const { name, email, phone, password, school = "", role = "teacher" } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Họ tên, email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "Email này đã được đăng ký tài khoản" }, { status: 400 });
    }

    const userId = "user-" + randomUUID().slice(0, 8);
    const username = email.split("@")[0] + "_" + Math.floor(Math.random() * 1000);

    db.prepare(`
      INSERT INTO users (id, username, password_hash, name, email, phone, role, school)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, password, name, email, phone || "", role, school);

    const user = {
      id: userId,
      username,
      name,
      email,
      phone,
      role,
      school,
    };

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
