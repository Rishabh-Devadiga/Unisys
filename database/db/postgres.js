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
  await seedMockData();
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
  getAppState,
  setAppState,
  clearAppState
};
