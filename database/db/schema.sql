CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  roll TEXT,
  class TEXT,
  dept TEXT,
  year TEXT,
  cgpa NUMERIC,
  phone TEXT,
  fees_due NUMERIC DEFAULT 0,
  attendance NUMERIC DEFAULT 0,
  status TEXT,
  created_at DATE
);

CREATE TABLE IF NOT EXISTS fees (
  id INTEGER PRIMARY KEY,
  student TEXT,
  student_id INTEGER,
  student_name TEXT,
  class TEXT,
  month TEXT,
  type TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT,
  due DATE,
  due_date DATE,
  mode TEXT
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

CREATE TABLE IF NOT EXISTS attendance_summary (
  id INTEGER PRIMARY KEY,
  cls TEXT,
  course TEXT,
  date DATE,
  present INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  pct NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admissions (
  id INTEGER PRIMARY KEY,
  name TEXT,
  program TEXT,
  stage TEXT,
  score NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY,
  code TEXT,
  name TEXT,
  credits NUMERIC DEFAULT 0,
  faculty TEXT,
  dept TEXT,
  sem TEXT,
  enrolled INTEGER DEFAULT 0,
  syllabus NUMERIC DEFAULT 0,
  cert TEXT
);

CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY,
  exam TEXT,
  course TEXT,
  date DATE,
  hall TEXT,
  marks NUMERIC DEFAULT 0,
  inv TEXT
);

CREATE TABLE IF NOT EXISTS faculty (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept TEXT,
  desig TEXT,
  load INTEGER DEFAULT 0,
  email TEXT,
  status TEXT,
  leave_balance INTEGER DEFAULT 0,
  courses JSONB
);

CREATE TABLE IF NOT EXISTS hr (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  dept TEXT,
  salary NUMERIC DEFAULT 0,
  shift TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS library (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  isbn TEXT,
  category TEXT,
  copies INTEGER DEFAULT 0,
  status TEXT
);

CREATE TABLE IF NOT EXISTS hostel (
  id INTEGER PRIMARY KEY,
  room TEXT,
  block TEXT,
  student TEXT,
  capacity INTEGER DEFAULT 0,
  mess TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS transport (
  id INTEGER PRIMARY KEY,
  route TEXT,
  vehicle TEXT,
  driver TEXT,
  capacity INTEGER DEFAULT 0,
  time TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS placements (
  id INTEGER PRIMARY KEY,
  company TEXT,
  role TEXT,
  pkg NUMERIC DEFAULT 0,
  date DATE,
  type TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS research (
  id INTEGER PRIMARY KEY,
  project TEXT,
  pi TEXT,
  agency TEXT,
  funding NUMERIC DEFAULT 0,
  start DATE,
  status TEXT
);

CREATE TABLE IF NOT EXISTS facilities (
  id INTEGER PRIMARY KEY,
  asset TEXT,
  location TEXT,
  tag TEXT,
  condition TEXT,
  ticket TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY,
  item TEXT,
  qty INTEGER DEFAULT 0,
  unit TEXT,
  store TEXT,
  reorder INTEGER DEFAULT 0,
  status TEXT
);

CREATE TABLE IF NOT EXISTS procurement (
  id INTEGER PRIMARY KEY,
  vendor TEXT,
  item TEXT,
  qty INTEGER DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  date DATE,
  status TEXT
);

CREATE TABLE IF NOT EXISTS service_requests (
  id INTEGER PRIMARY KEY,
  requester TEXT,
  category TEXT,
  subject TEXT,
  priority TEXT,
  assigned TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS communications (
  id INTEGER PRIMARY KEY,
  audience TEXT,
  channel TEXT,
  subject TEXT,
  message TEXT,
  date DATE
);

CREATE TABLE IF NOT EXISTS compliance (
  id INTEGER PRIMARY KEY,
  title TEXT,
  criterion TEXT,
  owner TEXT,
  type TEXT,
  status TEXT,
  file TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  hod TEXT,
  students INTEGER DEFAULT 0,
  faculty INTEGER DEFAULT 0,
  courses INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY,
  course TEXT,
  title TEXT,
  deadline DATE,
  submitted INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  status TEXT
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY,
  faculty TEXT,
  dept TEXT,
  from_date DATE,
  to_date DATE,
  days INTEGER DEFAULT 0,
  reason TEXT,
  status TEXT,
  applied_on DATE
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  audience TEXT,
  date DATE,
  priority TEXT,
  content TEXT
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY,
  event TEXT,
  start DATE,
  end DATE,
  type TEXT,
  dept TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY,
  user_name TEXT,
  action TEXT,
  target TEXT,
  timestamp TEXT,
  ip TEXT
);

CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY,
  hod TEXT,
  dept TEXT,
  title TEXT,
  description TEXT,
  status TEXT,
  date DATE
);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY,
  course TEXT,
  title TEXT,
  type TEXT,
  faculty TEXT,
  date DATE,
  size TEXT
);

CREATE TABLE IF NOT EXISTS timetable (
  id INTEGER PRIMARY KEY,
  day TEXT,
  time TEXT,
  course TEXT,
  room TEXT,
  faculty TEXT,
  batch TEXT
);
