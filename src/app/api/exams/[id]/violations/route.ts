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
      submission_id,
      event_type = "tab_switch",
      duration_away_seconds = 0,
      details = "Rời khỏi màn hình thi",
    } = body;

    const db = getDb();
    const violationId = "viol-" + randomUUID().slice(0, 8);

    db.prepare(`
      INSERT INTO violations (id, submission_id, event_type, duration_away_seconds, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      violationId,
      submission_id || "pending-sub",
      event_type,
      duration_away_seconds,
      details
    );

    return NextResponse.json({ success: true, violationId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
