CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  class TEXT,
  dept TEXT,
  fees_due NUMERIC DEFAULT 0,
  attendance NUMERIC DEFAULT 0,
  status TEXT,
  created_at DATE
);

CREATE TABLE IF NOT EXISTS fees (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  student_name TEXT,
  class TEXT,
  month TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT,
  due_date DATE
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  student_name TEXT,
  class TEXT,
  month TEXT,
  attendance_pct NUMERIC DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meetings (
  meeting_id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  scheduled_time TIMESTAMP,
  created_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
  created_by_ref TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  id SERIAL PRIMARY KEY,
  meeting_id TEXT REFERENCES meetings(meeting_id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  user_ref TEXT,
  role TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meeting_invites (
  id SERIAL PRIMARY KEY,
  meeting_id TEXT REFERENCES meetings(meeting_id) ON DELETE CASCADE,
  invited_user_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  invited_user_ref TEXT,
  invited_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
  invited_by_ref TEXT,
  status TEXT DEFAULT 'pending',
  invited_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  class TEXT,
  date DATE,
  status TEXT,
  marked_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
  marked_by_ref TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_uploads (
  id SERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  attendance JSONB,
  uploaded_by TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  source_file TEXT
);

CREATE TABLE IF NOT EXISTS marks (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  subject TEXT,
  marks NUMERIC DEFAULT 0,
  max_marks NUMERIC DEFAULT 100,
  grade TEXT,
  exam TEXT,
  recorded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS marks_student_subject_uq ON marks(student_id, subject_id);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  user_ref TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  meeting_id TEXT REFERENCES meetings(meeting_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
