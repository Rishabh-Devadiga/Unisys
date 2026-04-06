-- Add ERP tables for full DB-backed state
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS cgpa NUMERIC;
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE fees ADD COLUMN IF NOT EXISTS student TEXT;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS due DATE;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS mode TEXT;

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
