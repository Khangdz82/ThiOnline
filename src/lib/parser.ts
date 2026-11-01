import mammoth from "mammoth";

export interface ParsedOption {
  id: string; // 'A' | 'B' | 'C' | 'D' or 'a' | 'b' | 'c' | 'd'
  text: string;
  is_correct?: boolean;
}

export interface ParsedQuestion {
  index: number;
  type: "single_choice" | "multiple_choice" | "true_false" | "short_answer" | "essay";
  content: string;
  options: ParsedOption[];
  correct_answer: string;
  explanation: string;
  score: number;
}

export interface ParseResult {
  title?: string;
  questions: ParsedQuestion[];
  rawText: string;
}

/**
 * Parses raw text extracted from Word or pasted by teacher into structured questions.
 */
export function parseExamText(rawText: string): ParseResult {
  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // 1. Check for separate Answer Key Table at the bottom (e.g., "BẢNG ĐÁP ÁN", "ĐÁP ÁN:")
  const answerKeyMap = new Map<number, string>();
  const answerTableRegex = /(?:bảng\s+đáp\s+án|đáp\s+án\s+chi\s+tiết|phiếu\s+soi\s+đáp\s+án)[\s\S]*$/i;
  const matchTable = normalized.match(answerTableRegex);

  let bodyText = normalized;
  if (matchTable && matchTable.index !== undefined) {
    const tablePart = normalized.substring(matchTable.index);
    bodyText = normalized.substring(0, matchTable.index).trim();

    // Extract e.g. "1.A", "1 - B", "1: C", "Câu 1: D"
    const pairRegex = /(?:câu\s+)?(\d+)\s*[\.\:\-\s]+\s*([A-D]|đúng|sai|true|false)/gi;
    let pMatch;
    while ((pMatch = pairRegex.exec(tablePart)) !== null) {
      const qNum = parseInt(pMatch[1], 10);
      const ans = pMatch[2].toUpperCase();
      answerKeyMap.set(qNum, ans);
    }
  }

  // 2. Question Splitter: "Câu 1:", "Câu 2 (1.0 điểm):", "Bài 3:"
  // Matches line starting with (câu|bài) \d+ followed by optional (points) and : or .
  const questionSplitter = /(?:^|\n)\s*(?:câu|bài)\s+(\d+)(?:\s*\([^)]*\))?\s*[\:\.]\s+/gi;

  const indices: { start: number; qNum: number }[] = [];
  let match;
  while ((match = questionSplitter.exec(bodyText)) !== null) {
    const qNum = parseInt(match[1], 10);
    indices.push({ start: match.index, qNum });
  }

  const rawQuestions: { qNum: number; text: string }[] = [];
  if (indices.length > 0) {
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i].start;
      const end = i < indices.length - 1 ? indices[i + 1].start : bodyText.length;
      rawQuestions.push({
        qNum: indices[i].qNum || i + 1,
        text: bodyText.substring(start, end).trim(),
      });
    }
  } else {
    // Fallback: numbered lines e.g. "1.", "2."
    const numSplitter = /(?:^|\n)\s*(\d+)\s*[\.\:\)]\s+/g;
    let nMatch;
    while ((nMatch = numSplitter.exec(bodyText)) !== null) {
      indices.push({ start: nMatch.index, qNum: parseInt(nMatch[1], 10) });
    }
    if (indices.length > 0) {
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i].start;
        const end = i < indices.length - 1 ? indices[i + 1].start : bodyText.length;
        rawQuestions.push({
          qNum: indices[i].qNum || i + 1,
          text: bodyText.substring(start, end).trim(),
        });
      }
    } else {
      const paragraphs = bodyText.split(/\n{2,}/);
      paragraphs.forEach((p, idx) => {
        if (p.trim()) {
          rawQuestions.push({ qNum: idx + 1, text: p.trim() });
        }
      });
    }
  }

  // 3. Parse each question block
  const questions: ParsedQuestion[] = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const item = rawQuestions[i];
    const qParsed = parseSingleQuestionBlock(item.text, item.qNum, answerKeyMap.get(item.qNum));
    questions.push(qParsed);
  }

  return {
    questions,
    rawText: normalized,
  };
}

function parseSingleQuestionBlock(text: string, qNum: number, tableAnswer?: string): ParsedQuestion {
  // Strip question heading cleanly: "Câu 1: ", "Câu 2 (1.0 điểm): ", etc.
  const cleanHeader = text.replace(/^\s*(?:câu|bài)\s*\d+(?:\s*\([^)]*\))?\s*[\:\.]\s*/i, "").trim();

  // Check if it's essay ("tự luận")
  const isExplicitEssay = /(?:tự\s+luận|chứng\s+minh\s+rằng|hãy\s+giải)/i.test(text.substring(0, 60));

  // Extract Explanation if present ("Lời giải:", "Hướng dẫn giải:")
  let explanation = "";
  let body = cleanHeader;
  const expMatch = body.match(/(?:lời\s+giải|hướng\s+dẫn\s+giải|giải\s+chi\s+tiết)\s*[\:\.]([\s\S]*)$/i);
  if (expMatch && expMatch.index !== undefined) {
    explanation = expMatch[1].trim();
    body = body.substring(0, expMatch.index).trim();
  }

  // Extract individual answer if present ("Đáp án: A" or "Chọn A")
  let inlineAnswer = "";
  const ansMatch = body.match(/(?:đáp\s+án|chọn)\s*[\:\.\-]?\s*([A-D]|true|false|đúng|sai)/i);
  if (ansMatch) {
    inlineAnswer = ansMatch[1].toUpperCase();
    body = body.replace(ansMatch[0], "").trim();
  }

  const finalCorrectAnswer = inlineAnswer || tableAnswer || "";

  // Check 4-choice Options uppercase A. B. C. D. FIRST!
  const optHeaderRegex = /(?:^|\n|\s{2,}|\t)([A-D])[\.\:\)]\s+/g;
  const optPositions: { id: string; start: number; textStart: number }[] = [];
  let m;
  while ((m = optHeaderRegex.exec(body)) !== null) {
    optPositions.push({
      id: m[1],
      start: m.index,
      textStart: m.index + m[0].length,
    });
  }

  if (optPositions.length >= 2 && !isExplicitEssay) {
    const promptText = body.substring(0, optPositions[0].start).trim();
    const options: ParsedOption[] = [];

    for (let i = 0; i < optPositions.length; i++) {
      const cur = optPositions[i];
      const end = i < optPositions.length - 1 ? optPositions[i + 1].start : body.length;
      options.push({
        id: cur.id,
        text: body.substring(cur.textStart, end).trim(),
      });
    }

    return {
      index: qNum,
      type: "single_choice",
      content: promptText || `Câu hỏi ${qNum}`,
      options,
      correct_answer: finalCorrectAnswer || (options[0] ? options[0].id : "A"),
      explanation,
      score: 1.0,
    };
  }

  // Check GDPT 2018 True/False format with lowercase sub-items a), b), c), d)
  const tfRegex = /(?:\n|^)\s*([a-d])\s*[\)\.\:]\s*([^\n]+)/g;
  const tfMatches = [...body.matchAll(tfRegex)];

  if (tfMatches.length >= 2 && !isExplicitEssay) {
    const options: ParsedOption[] = [];
    const firstMatchIdx = body.search(tfRegex);
    const questionPrompt = (firstMatchIdx > 0 ? body.substring(0, firstMatchIdx) : body).trim();

    for (const matchItem of tfMatches) {
      options.push({
        id: matchItem[1].toUpperCase(),
        text: matchItem[2].trim(),
      });
    }

    return {
      index: qNum,
      type: "true_false",
      content: questionPrompt || `Câu hỏi ${qNum}`,
      options,
      correct_answer: finalCorrectAnswer,
      explanation,
      score: 1.0,
    };
  }

  return {
    index: qNum,
    type: isExplicitEssay ? "essay" : "short_answer",
    content: body || `Câu hỏi ${qNum}`,
    options: [],
    correct_answer: finalCorrectAnswer,
    explanation,
    score: 1.0,
  };
}

/**
 * Parse Word .docx Buffer to structured text and questions
 */
export async function parseDocxBuffer(buffer: Buffer): Promise<ParseResult> {
  const result = await mammoth.extractRawText({ buffer });
  return parseExamText(result.value);
}
