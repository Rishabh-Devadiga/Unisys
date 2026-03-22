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
