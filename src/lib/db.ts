import Database from "better-sqlite3";
import path from "path";

// Initialize SQLite Database in user root or documents directory
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "azota.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
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
      duration INTEGER DEFAULT 45,
      exam_type TEXT DEFAULT 'test',
      password TEXT,
      is_published INTEGER DEFAULT 1,
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
  `);
}
