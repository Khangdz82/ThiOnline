import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // 1. Delete all students belonging to this class
    db.prepare("DELETE FROM students WHERE class_id = ?").run(id);

    // 2. Delete the class itself
    const result = db.prepare("DELETE FROM classes WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy lớp học" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Đã xóa lớp học thành công" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
