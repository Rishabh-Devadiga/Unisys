const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DEFAULT_TABLES = ['students', 'fees', 'attendance'];
const SEED_FILE = path.join(__dirname, '..', 'data', 'erp-database.json');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres'
});

function quoteIdentifier(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function loadSeedData() {
  const raw = fs.readFileSync(SEED_FILE, 'utf8');
  return JSON.parse(raw);
}

async function query(text, params) {
  return pool.query(text, params || []);
}

async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
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
  `);
  
  // Add email column if it doesn't exist
  try {
    await query(`ALTER TABLE students ADD COLUMN email TEXT;`);
  } catch (e) {
    // Column likely already exists, ignore
  }
  try {
    await query(`ALTER TABLE students ADD COLUMN roll TEXT;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE students ADD COLUMN year TEXT;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE students ADD COLUMN cgpa NUMERIC;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE students ADD COLUMN phone TEXT;`);
  } catch (e) {}

  await query(`
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
  `);
  try {
    await query(`ALTER TABLE fees ADD COLUMN student TEXT;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE fees ADD COLUMN type TEXT;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE fees ADD COLUMN due DATE;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE fees ADD COLUMN mode TEXT;`);
  } catch (e) {}

  await query(`
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
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS attendance_summary (
      id INTEGER PRIMARY KEY,
      cls TEXT,
      course TEXT,
      date DATE,
      present INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      pct NUMERIC DEFAULT 0
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY,
      name TEXT,
      program TEXT,
      stage TEXT,
      score NUMERIC DEFAULT 0
    );
  `);

  await query(`
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
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY,
      exam TEXT,
      course TEXT,
      date DATE,
      hall TEXT,
      marks NUMERIC DEFAULT 0,
      inv TEXT
    );
  `);

  await query(`
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
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS hr (
      id INTEGER PRIMARY KEY,
      name TEXT,
      role TEXT,
      dept TEXT,
      salary NUMERIC DEFAULT 0,
      shift TEXT,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS library (
      id INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      isbn TEXT,
      category TEXT,
      copies INTEGER DEFAULT 0,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS hostel (
      id INTEGER PRIMARY KEY,
      room TEXT,
      block TEXT,
      student TEXT,
      capacity INTEGER DEFAULT 0,
      mess TEXT,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transport (
      id INTEGER PRIMARY KEY,
      route TEXT,
      vehicle TEXT,
      driver TEXT,
      capacity INTEGER DEFAULT 0,
      time TEXT,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS placements (
      id INTEGER PRIMARY KEY,
      company TEXT,
      role TEXT,
      pkg NUMERIC DEFAULT 0,
      date DATE,
      type TEXT,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS research (
      id INTEGER PRIMARY KEY,
      project TEXT,
      pi TEXT,
      agency TEXT,
      funding NUMERIC DEFAULT 0,
      start DATE,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY,
      asset TEXT,
      location TEXT,
      tag TEXT,
      condition TEXT,
      ticket TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY,
      item TEXT,
      qty INTEGER DEFAULT 0,
      unit TEXT,
      store TEXT,
      reorder INTEGER DEFAULT 0,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS procurement (
      id INTEGER PRIMARY KEY,
      vendor TEXT,
      item TEXT,
      qty INTEGER DEFAULT 0,
      amount NUMERIC DEFAULT 0,
      date DATE,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY,
      requester TEXT,
      category TEXT,
      subject TEXT,
      priority TEXT,
      assigned TEXT,
      status TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY,
      audience TEXT,
      channel TEXT,
      subject TEXT,
      message TEXT,
      date DATE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS compliance (
      id INTEGER PRIMARY KEY,
      title TEXT,
      criterion TEXT,
      owner TEXT,
      type TEXT,
      status TEXT,
      file TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY,
      name TEXT,
      hod TEXT,
      students INTEGER DEFAULT 0,
      faculty INTEGER DEFAULT 0,
      courses INTEGER DEFAULT 0,
      rating NUMERIC DEFAULT 0
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY,
      course TEXT,
      title TEXT,
      deadline DATE,
      submitted INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      status TEXT
    );
  `);

  await query(`
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
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      audience TEXT,
      date DATE,
      priority TEXT,
      content TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY,
      event TEXT,
      start DATE,
      end DATE,
      type TEXT,
      dept TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY,
      user_name TEXT,
      action TEXT,
      target TEXT,
      timestamp TEXT,
      ip TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY,
      hod TEXT,
      dept TEXT,
      title TEXT,
      description TEXT,
      status TEXT,
      date DATE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY,
      course TEXT,
      title TEXT,
      type TEXT,
      faculty TEXT,
      date DATE,
      size TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY,
      day TEXT,
      time TEXT,
      course TEXT,
      room TEXT,
      faculty TEXT,
      batch TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS meetings (
      meeting_id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      scheduled_time TIMESTAMP,
      created_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
      created_by_ref TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS meeting_participants (
      id SERIAL PRIMARY KEY,
      meeting_id TEXT REFERENCES meetings(meeting_id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
      user_ref TEXT,
      role TEXT,
      joined_at TIMESTAMP DEFAULT NOW(),
      left_at TIMESTAMP
    );
  `);

  await query(`
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
  `);

  await query(`
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
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attendance_uploads (
      id SERIAL PRIMARY KEY,
      student_name TEXT NOT NULL,
      attendance JSONB,
      uploaded_by TEXT,
      upload_date TIMESTAMP DEFAULT NOW(),
      source_file TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attendance_uploads (
      id SERIAL PRIMARY KEY,
      student_name TEXT NOT NULL,
      attendance JSONB,
      uploaded_by TEXT,
      upload_date TIMESTAMP DEFAULT NOW(),
      source_file TEXT
    );
  `);

  await query(`
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
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS marks_student_subject_uq ON marks(student_id, subject_id);
  `);

  await query(`
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
  `);
}

async function upsertRows(tableName, rows) {
  if (!Array.isArray(rows) || !rows.length) return;
  const columns = Object.keys(rows[0]);
  const colSql = columns.map(quoteIdentifier).join(', ');
  const updateSql = columns
    .filter((col) => col !== 'id')
    .map((col) => `${quoteIdentifier(col)} = EXCLUDED.${quoteIdentifier(col)}`)
    .join(', ');

  const values = [];
  const valueRows = rows.map((row, rowIndex) => {
    const rowPlaceholders = columns.map((col, colIndex) => {
      values.push(row[col]);
      return `$${rowIndex * columns.length + colIndex + 1}`;
    });
    return `(${rowPlaceholders.join(', ')})`;
  });

  const sql = `
    INSERT INTO ${quoteIdentifier(tableName)} (${colSql})
    VALUES ${valueRows.join(', ')}
    ON CONFLICT (id)
    DO UPDATE SET ${updateSql};
  `;
  await query(sql, values);
}

async function seedMockData() {
  const seed = loadSeedData();
  for (const tableName of DEFAULT_TABLES) {
    await upsertRows(tableName, seed[tableName] || []);
  }
}

async function initDatabase() {
  await ensureSchema();
  if (String(process.env.SEED_DB || '').toLowerCase() === 'true') {
    await seedMockData();
  }
}

async function getSchema() {
  const result = await query(
    `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `
  );

  const grouped = {};
  result.rows.forEach((row) => {
    if (!grouped[row.table_name]) grouped[row.table_name] = [];
    grouped[row.table_name].push({
      name: row.column_name,
      type: row.data_type
    });
  });

  return Object.keys(grouped).map((tableName) => ({
    name: tableName,
    columns: grouped[tableName]
  }));
}

async function listTables() {
  const schema = await getSchema();
  return schema.map((table) => table.name);
}

async function getTableRows(tableName, limit) {
  const tables = await listTables();
  if (tables.indexOf(tableName) === -1) return null;
  const maxRows = Number(limit);
  if (Number.isFinite(maxRows) && maxRows > 0) {
    const result = await query(
      `SELECT * FROM ${quoteIdentifier(tableName)} LIMIT $1`,
      [maxRows]
    );
    return result.rows;
  }
  const result = await query(`SELECT * FROM ${quoteIdentifier(tableName)}`);
  return result.rows;
}

async function insertRecord(tableName, payload) {
  const schema = await getSchema();
  const table = schema.find((item) => item.name === tableName);
  if (!table) return null;

  const validCols = table.columns.map((col) => col.name).filter((col) => col !== 'id');
  const keys = Object.keys(payload || {}).filter((key) => validCols.indexOf(key) > -1);
  if (!keys.length) return null;

  const vals = keys.map((key) => payload[key]);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `
    INSERT INTO ${quoteIdentifier(tableName)} (${keys.map(quoteIdentifier).join(', ')})
    VALUES (${placeholders})
    RETURNING *;
  `;
  const result = await query(sql, vals);
  return result.rows[0] || null;
}

async function replaceTableRows(tableName, rows) {
  const schema = await getSchema();
  const table = schema.find((item) => item.name === tableName);
  if (!table) return null;
  await query(`DELETE FROM ${quoteIdentifier(tableName)};`);
  if (!Array.isArray(rows) || !rows.length) return [];
  const validCols = table.columns.map((col) => col.name);
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const keys = Object.keys(row).filter((key) => validCols.includes(key));
    if (!keys.length) continue;
    const vals = keys.map((key) => row[key]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `
      INSERT INTO ${quoteIdentifier(tableName)} (${keys.map(quoteIdentifier).join(', ')})
      VALUES (${placeholders});
    `;
    await query(sql, vals);
  }
  return rows;
}

async function getAppState(id) {
  const key = id || 'default';
  const result = await query(
    `SELECT data FROM app_state WHERE id = $1 LIMIT 1`,
    [key]
  );
  return result.rows[0] ? result.rows[0].data : null;
}

async function setAppState(id, payload) {
  const key = id || 'default';
  const data = JSON.stringify(payload || {});
  await query(
    `
      INSERT INTO app_state (id, data, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `,
    [key, data]
  );
}

async function clearAppState(id) {
  const key = id || 'default';
  await query(`DELETE FROM app_state WHERE id = $1`, [key]);
}

module.exports = {
  pool,
  query,
  initDatabase,
  getSchema,
  listTables,
  getTableRows,
  insertRecord,
  replaceTableRows,
  getAppState,
  setAppState,
  clearAppState
};
