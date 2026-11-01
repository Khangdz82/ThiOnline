import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

console.log("🚀 [ThiOnline] Đang tiến hành cài đặt và khởi tạo hệ thống...");

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "azota.db");

// 1. Initialize SQLite Database
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// 2. Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'teacher',
    school TEXT,
    points INTEGER DEFAULT 500,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    name TEXT NOT NULL,
    grade TEXT,
    school_year TEXT,
    code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    student_code TEXT,
    gender TEXT,
    dob TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT DEFAULT 'Toán',
    grade TEXT DEFAULT '12',
    duration INTEGER DEFAULT 45,
    exam_type TEXT DEFAULT 'test',
    password TEXT,
    is_published INTEGER DEFAULT 1,
    target_mode TEXT DEFAULT 'public',
    assigned_class_ids TEXT DEFAULT '[]',
    shuffle_questions INTEGER DEFAULT 0,
    shuffle_options INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 1,
    allow_view_score TEXT DEFAULT 'after_submit',
    allow_view_answers INTEGER DEFAULT 1,
    anti_cheat_level TEXT DEFAULT 'basic',
    start_time DATETIME,
    end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    question_index INTEGER NOT NULL,
    type TEXT DEFAULT 'single_choice',
    content TEXT NOT NULL,
    options TEXT DEFAULT '[]',
    correct_answer TEXT,
    explanation TEXT,
    score REAL DEFAULT 1.0,
    raw_image TEXT,
    cognitive_level TEXT DEFAULT 'thong_hieu',
    subject TEXT,
    grade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    student_id TEXT,
    student_name TEXT NOT NULL,
    student_code TEXT,
    class_name TEXT,
    answers TEXT DEFAULT '{}',
    score REAL DEFAULT 0,
    total_score REAL DEFAULT 10,
    status TEXT DEFAULT 'in_progress',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    duration_seconds INTEGER DEFAULT 0,
    graded_at DATETIME,
    teacher_feedback TEXT,
    essay_annotations TEXT DEFAULT '[]',
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS violations (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_away_seconds INTEGER DEFAULT 0,
    details TEXT,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS question_bank (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    subject TEXT,
    grade TEXT,
    topic TEXT,
    type TEXT DEFAULT 'single_choice',
    content TEXT NOT NULL,
    options TEXT DEFAULT '[]',
    correct_answer TEXT,
    explanation TEXT,
    cognitive_level TEXT DEFAULT 'thong_hieu',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shared_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    topic TEXT,
    duration INTEGER DEFAULT 45,
    question_count INTEGER DEFAULT 10,
    questions TEXT NOT NULL,
    description TEXT,
    downloads INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrations
try { db.exec("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 500"); } catch {}
try { db.exec("ALTER TABLE exams ADD COLUMN target_mode TEXT DEFAULT 'public'"); } catch {}
try { db.exec("ALTER TABLE exams ADD COLUMN subject TEXT DEFAULT 'Toán'"); } catch {}
try { db.exec("ALTER TABLE exams ADD COLUMN grade TEXT DEFAULT '12'"); } catch {}

console.log("✅ Cấu trúc Database đã sẵn sàng!");

// 3. Ensure Teacher Account
const teacher = db.prepare("SELECT * FROM users WHERE username = 'giaovien'").get();
if (!teacher) {
  db.prepare(`
    INSERT INTO users (id, username, password_hash, name, email, phone, role, school, points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "teacher-demo-01",
    "giaovien",
    "password123",
    "Thầy Nguyễn Văn Nam",
    "nam.nguyen@edu.vn",
    "0987654321",
    "teacher",
    "THPT Chuyên Hà Nội - Amsterdam",
    500
  );
  console.log("✅ Đã khởi tạo tài khoản Giáo viên: giaovien / password123 (500 Points)");
} else {
  db.prepare("UPDATE users SET points = COALESCE(points, 500) WHERE id = 'teacher-demo-01'").run();
  console.log("✅ Tài khoản Giáo viên 'giaovien' đã có sẵn (500 Points).");
}

console.log("\n========================================================");
console.log("🎉 CÀI ĐẶT HOÀN TẤT! HỆ THỐNG SẴN SÀNG CHẠY:");
console.log("   - Đăng nhập Giáo viên:  giaovien / password123");
console.log("   - Số Point OCR & AI:    500 Point");
console.log("   - Đề thi mẫu:           exam-demo-toan-12");
console.log("   - Lệnh khởi chạy:       npm run dev  (hoặc npm start)");
console.log("========================================================\n");
