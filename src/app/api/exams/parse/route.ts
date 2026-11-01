import { NextResponse } from "next/server";
import { parseDocxBuffer, parseExamText } from "@/lib/parser";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: "Không tìm thấy file" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await parseDocxBuffer(buffer);
      return NextResponse.json({ success: true, ...parsed });
    }

    // Otherwise JSON payload with rawText
    const body = await req.json();
    if (!body.rawText) {
      return NextResponse.json({ success: false, error: "Thiếu văn bản đề thi" }, { status: 400 });
    }

    const parsed = parseExamText(body.rawText);
    return NextResponse.json({ success: true, ...parsed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
