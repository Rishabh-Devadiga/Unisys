const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const XLSX = require('xlsx');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const db = require('../database/db/postgres');
const PgSession = require('connect-pg-simple')(session);
const createMeetingsRouter = require('./routes/meetings');
const { initSignaling } = require('./socket/signaling');
const { initErpSockets } = require('./socket/erp');
const createStudentsRouter = require('./routes/students');
const createFacultyRouter = require('./routes/faculty');
const createAttendanceRouter = require('./routes/attendance');
const createMarksRouter = require('./routes/marks');
const createNotificationsRouter = require('./routes/notifications');
const createPresenceRouter = require('./routes/presence');
const createErpStateRouter = require('./routes/erpState');
const createAttendanceUploadsRouter = require('./routes/attendanceUploads');
const { getIceServers, updateTurnHealth, getTurnHealth } = require('./utils/turnService');
const { getUserFromSession, getUserFromHeaders, requireAuth } = require('./services/auth');
const erpStateService = require('./services/erpStateService');
const SYSTEM_KEY_ID = 'system_key';
const USERS_STORE_ID = 'users_store';

const app = express();
const PORT = 3001;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.disable('x-powered-by');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

// SMTP configuration (Gmail App Password)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || 'edusysalert@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.SMTP_FROM || SMTP_USER;

const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

if (!SMTP_PASS) {
  console.warn('[SMTP] SMTP_PASS is not set. Email sending will be disabled.');
}

if (String(process.env.TRUST_PROXY || '').toLowerCase() === 'true') {
  app.set('trust proxy', 1);
}

const corsOrigins = String(process.env.CORS_ORIGIN || '').trim();
const corsOptions = corsOrigins
  ? { origin: corsOrigins.split(',').map((o) => o.trim()), credentials: true }
  : { origin: true, credentials: true };

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false
});

let sessionStore;
try {
  sessionStore = new PgSession({
    pool: db.pool,
    tableName: 'session',
    createTableIfMissing: true
  });
} catch (err) {
  sessionStore = new session.MemoryStore();
  console.warn('[SESSION] Falling back to MemoryStore. Set up Postgres for production.');
}

const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-me';
if (sessionSecret === 'dev-secret-change-me') {
  console.warn('[SESSION] SESSION_SECRET not set. Using insecure default.');
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'erp_sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: String(process.env.NODE_ENV || '').toLowerCase() === 'production'
  }
}));
app.use(express.static(FRONTEND_DIR));
app.use('/api/system-key/verify', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/request-access', authLimiter);
// Keep legacy hash-based meetings routes working by redirecting /meetings to /#/meetings.
app.get(/^\/meetings(\/.*)?$/, (req, res) => {
  const rest = req.path.replace(/^\/meetings/, '');
  const qsIndex = req.originalUrl.indexOf('?');
  const qs = qsIndex >= 0 ? req.originalUrl.slice(qsIndex) : '';
  const target = rest && rest !== '/' ? `/#/meetings${rest}${qs}` : `/#/meetings${qs}`;
  res.redirect(302, target);
});

app.get('/calls/turn-health', (req, res) => {
  return res.json(getTurnHealth());
});

app.get('/calls/ice-servers', async (req, res) => {
  try {
    const payload = await getIceServers();
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate iceServers' });
  }
});

app.get('/api/system-key', async (req, res) => {
  try {
    const data = await db.getAppState(SYSTEM_KEY_ID);
    const key = data && data.key ? String(data.key) : null;
    return res.json({ exists: !!key, key });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch system key' });
  }
});

app.post('/api/system-key', async (req, res) => {
  try {
    const rawKey = String((req.body || {}).key || '').trim().toUpperCase();
    if (!rawKey) return res.status(400).json({ error: 'key is required' });
    const existing = await db.getAppState(SYSTEM_KEY_ID);
    const existingKey = existing && existing.key ? String(existing.key).toUpperCase() : null;
    if (existingKey) {
      if (!requireAdmin(req, res)) return;
      if (existingKey !== rawKey && !(req.body || {}).force) {
        return res.status(409).json({ error: 'System key already set' });
      }
    }
    await db.setAppState(SYSTEM_KEY_ID, { key: rawKey });
    return res.json({ ok: true, key: rawKey });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to store system key' });
  }
});

app.post('/api/system-key/verify', async (req, res) => {
  try {
    const rawKey = String((req.body || {}).key || '').trim().toUpperCase();
    if (!rawKey) return res.status(400).json({ error: 'key is required' });
    const existing = await db.getAppState(SYSTEM_KEY_ID);
    const existingKey = existing && existing.key ? String(existing.key).toUpperCase() : null;
    return res.json({ valid: !!existingKey && existingKey === rawKey });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify system key' });
  }
});

async function getUserStore() {
  const data = await db.getAppState(USERS_STORE_ID);
  return data && typeof data === 'object'
    ? { users: Array.isArray(data.users) ? data.users : [], auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [] }
    : { users: [], auditLogs: [] };
}

async function saveUserStore(store) {
  await db.setAppState(USERS_STORE_ID, store || { users: [], auditLogs: [] });
}

function isBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2');
}

async function hashPassword(password) {
  return bcrypt.hash(String(password), 10);
}

async function verifyPassword(password, stored) {
  if (!stored) return false;
  if (isBcryptHash(stored)) {
    return bcrypt.compare(String(password), stored);
  }
  return String(password) === String(stored);
}

function requireAdmin(req, res) {
  const user = getUserFromSession(req) || getUserFromHeaders(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
}

function requireApprover(req, res) {
  const user = getUserFromSession(req) || getUserFromHeaders(req);
  const rawRole = String(user && user.rawRole ? user.rawRole : '').toLowerCase();
  if (!user || !(user.role === 'admin' || rawRole === 'hod' || rawRole === 'head')) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
}

app.get('/api/users', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const store = await getUserStore();
    const safeUsers = (store.users || []).map((user) => {
      if (!user || typeof user !== 'object') return user;
      const { password: _pw, ...safeUser } = user;
      return safeUser;
    });
    return res.json(safeUsers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users/request-access', async (req, res) => {
  try {
    const payload = req.body || {};
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '').trim();
    const role = String(payload.role || 'Faculty').trim();
    const dept = String(payload.dept || 'General').trim();
    const institute = String(payload.institute || '').trim();
    const key = String(payload.key || '').trim().toUpperCase();
    if (!name || !email || !password || !key) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const sys = await db.getAppState(SYSTEM_KEY_ID);
    const sysKey = sys && sys.key ? String(sys.key).toUpperCase() : null;
    if (key !== 'EDU-DEMO-2026' && (!sysKey || key !== sysKey)) {
      return res.status(403).json({ error: 'Invalid System Key' });
    }

    const store = await getUserStore();
    const exists = store.users.find((u) => u.email && String(u.email).toLowerCase() === email);
    if (exists) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const now = new Date();
    const instNorm = institute ? String(institute).trim().toLowerCase() : '';
    const hasActiveHead = store.users.some((u) => {
      if (String(u.role || '').toLowerCase() !== 'head') return false;
      if (String(u.status || '') !== 'Active') return false;
      if (!instNorm) return true;
      return String(u.institute || '').trim().toLowerCase() === instNorm;
    });
    const autoActivateHead = String(role || '').toLowerCase() === 'head' && !hasActiveHead;
    const status = autoActivateHead ? 'Active' : 'Pending';
    const hashedPassword = await hashPassword(password);
    const user = {
      id: Date.now(),
      name,
      email,
      role,
      requestedRole: role,
      dept,
      status,
      lastLogin: '-',
      institute,
      password: hashedPassword,
      requestedOn: now.toISOString().split('T')[0]
    };
    store.users.push(user);
    store.auditLogs = store.auditLogs || [];
    store.auditLogs.unshift({
      id: Date.now(),
      user: name,
      action: autoActivateHead ? 'Head Auto-Approved' : 'Access Requested',
      target: role + ' - ' + dept,
      timestamp: now.toLocaleString(),
      note: institute
    });
    await saveUserStore(store);
    const { password: _pw, ...safeUser } = user;
    return res.json({ ok: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to request access' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const payload = req.body || {};
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '').trim();
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Missing credentials' });
    }
    const store = await getUserStore();
    const user = store.users.find((u) =>
      u.email && String(u.email).toLowerCase() === email
    );
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    if (user.status && user.status !== 'Active') {
      return res.json({ ok: false, status: user.status });
    }
    user.lastLogin = new Date().toLocaleString();
    if (!isBcryptHash(user.password)) {
      try {
        user.password = await hashPassword(password);
      } catch (err) {
        // ignore hash upgrade failure
      }
    }
    await saveUserStore(store);
    if (req.session) {
      req.session.user = {
        id: user.id || user.email,
        email: user.email,
        role: user.role || 'Faculty',
        name: user.name || user.email,
        institute: user.institute || ''
      };
    }
    const { password: _pw, ...safeUser } = user;
    return res.json({ ok: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

app.get('/api/users/me', (req, res) => {
  const user = getUserFromSession(req) || getUserFromHeaders(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.rawRole || user.role
    }
  });
});

app.post('/api/users/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie('erp_sid');
    res.json({ ok: true });
  });
});

app.post('/api/users/approve', async (req, res) => {
  try {
    if (!requireApprover(req, res)) return;
    const payload = req.body || {};
    const id = payload.id != null ? Number(payload.id) : null;
    const email = String(payload.email || '').trim().toLowerCase();
    const status = String(payload.status || '').trim();
    if (!status || (status !== 'Active' && status !== 'Rejected')) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const store = await getUserStore();
    const user = store.users.find((u) =>
      (id != null && Number(u.id) === id) || (email && String(u.email || '').toLowerCase() === email)
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = status;
    if (status === 'Active') user.lastLogin = user.lastLogin || '-';
    store.auditLogs = store.auditLogs || [];
    store.auditLogs.unshift({
      id: Date.now(),
      user: user.name || email,
      action: status === 'Active' ? 'Account Approved' : 'Account Rejected',
      target: user.role || '',
      timestamp: new Date().toLocaleString()
    });
    await saveUserStore(store);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
initSignaling(io);
initErpSockets(io);
app.use('/api/meetings', createMeetingsRouter(io));
app.use('/api/students', createStudentsRouter());
app.use('/api/faculty', createFacultyRouter());
app.use('/api/attendance', createAttendanceRouter());
app.use('/api/marks', createMarksRouter());
app.use('/api/notifications', createNotificationsRouter(io));
app.use('/api/presence', createPresenceRouter());
app.use('/api/erp-state', createErpStateRouter());
app.use('/', createAttendanceUploadsRouter());

const SAFE_OPERATORS = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'between']);
const SAFE_AGGREGATIONS = new Set(['sum', 'avg', 'count', 'min', 'max']);

const API_DATASETS = {
  '/api/source/attendance-summary': async () => {
    const rows = await db.getTableRows('attendance');
    const byClass = new Map();
    rows.forEach((row) => {
      const key = row.class || 'Unknown';
      const item = byClass.get(key) || { class: key, total: 0, count: 0 };
      item.total += Number(row.attendance_pct) || 0;
      item.count += 1;
      byClass.set(key, item);
    });
    return Array.from(byClass.values()).map((item) => ({
      class: item.class,
      attendance_pct: Number((item.total / Math.max(item.count, 1)).toFixed(2))
    }));
  },
  '/api/source/fees-summary': async () => {
    const rows = await db.getTableRows('fees');
    const byMonth = new Map();
    rows.forEach((row) => {
      const key = row.month || 'Unknown';
      const item = byMonth.get(key) || { month: key, amount: 0, count: 0 };
      item.amount += Number(row.amount) || 0;
      item.count += 1;
      byMonth.set(key, item);
    });
    return Array.from(byMonth.values()).map((item) => ({
      month: item.month,
      amount: item.amount,
      records: item.count
    }));
  },
  '/api/source/student-status': async () => {
    const rows = await db.getTableRows('students');
    const byStatus = new Map();
    rows.forEach((row) => {
      const key = row.status || 'Unknown';
      byStatus.set(key, (byStatus.get(key) || 0) + 1);
    });
    return Array.from(byStatus.entries()).map(([status, count]) => ({
      status,
      count
    }));
  }
};

function inferValue(value) {
  if (value == null) return '';
  return String(value);
}

async function getTableColumns(tableName) {
  const schema = await db.getSchema();
  const table = schema.find((item) => item.name === tableName);
  if (!table) return null;
  return table.columns.map((col) => col.name);
}

function sanitizeFilter(filter, allowedColumns) {
  if (!filter || typeof filter !== 'object') return null;
  const field = String(filter.field || '').trim();
  const operator = String(filter.operator || 'eq').trim();
  const value = filter.value;
  if (!field || !allowedColumns.includes(field)) return null;
  if (!SAFE_OPERATORS.has(operator)) return null;
  return { field, operator, value };
}

function runFilter(row, filter) {
  const left = row[filter.field];
  const right = filter.value;
  switch (filter.operator) {
    case 'eq': return String(left) === String(right);
    case 'neq': return String(left) !== String(right);
    case 'gt': return Number(left) > Number(right);
    case 'gte': return Number(left) >= Number(right);
    case 'lt': return Number(left) < Number(right);
    case 'lte': return Number(left) <= Number(right);
    case 'contains': return inferValue(left).toLowerCase().includes(inferValue(right).toLowerCase());
    case 'in': {
      const list = Array.isArray(right) ? right : inferValue(right).split(',').map((v) => v.trim());
      return list.map(String).includes(String(left));
    }
    case 'between': {
      const pair = Array.isArray(right) ? right : inferValue(right).split(',').map((v) => v.trim());
      if (pair.length < 2) return true;
      const min = Number(pair[0]);
      const max = Number(pair[1]);
      const val = Number(left);
      return Number.isFinite(val) && val >= min && val <= max;
    }
    default: return true;
  }
}

function applyFilters(rows, filters, allowedColumns) {
  const safeFilters = (Array.isArray(filters) ? filters : [])
    .map((filter) => sanitizeFilter(filter, allowedColumns))
    .filter(Boolean);
  return rows.filter((row) => safeFilters.every((filter) => runFilter(row, filter)));
}

function aggregate(values, aggregation) {
  const nums = values.map((v) => Number(v)).filter((v) => Number.isFinite(v));
  switch (aggregation) {
    case 'sum': return nums.reduce((sum, item) => sum + item, 0);
    case 'avg': return nums.length ? nums.reduce((sum, item) => sum + item, 0) / nums.length : 0;
    case 'count': return values.length;
    case 'min': return nums.length ? Math.min(...nums) : 0;
    case 'max': return nums.length ? Math.max(...nums) : 0;
    default: return 0;
  }
}

function groupRows(rows, groupByField, metricField, aggregation) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row[groupByField];
    const item = groups.get(key) || [];
    item.push(row[metricField]);
    groups.set(key, item);
  });
  return Array.from(groups.entries()).map(([key, values]) => ({
    key,
    value: aggregate(values, aggregation)
  }));
}

async function executeBinding(binding, componentType) {
  const sourceType = String(binding && binding.sourceType ? binding.sourceType : 'database');
  let rows = [];
  let sourceColumns = [];

  if (sourceType === 'database' || sourceType === 'custom_query') {
    const table = String(binding.table || '').trim();
    const tableRows = await db.getTableRows(table);
    if (!tableRows) {
      const err = new Error(`Table not found: ${table}`);
      err.status = 400;
      throw err;
    }
    sourceColumns = await getTableColumns(table) || [];
    rows = applyFilters(tableRows, binding.filters, sourceColumns);
  } else if (sourceType === 'api_endpoint') {
    const endpoint = String(binding.endpoint || '').trim();
    const provider = API_DATASETS[endpoint];
    if (!provider) {
      const err = new Error(`Endpoint is not whitelisted: ${endpoint}`);
      err.status = 400;
      throw err;
    }
    rows = await provider();
    const columnSet = new Set();
    rows.forEach((row) => Object.keys(row || {}).forEach((key) => columnSet.add(key)));
    sourceColumns = Array.from(columnSet);
    rows = applyFilters(rows, binding.filters, sourceColumns);
  } else {
    const err = new Error('Unsupported source type');
    err.status = 400;
    throw err;
  }

  const limit = Number(binding.limit);
  if (Number.isFinite(limit) && limit > 0) rows = rows.slice(0, limit);

  const chartTypes = new Set(['bar_chart', 'line_chart', 'area_chart', 'pie_chart']);
  if (chartTypes.has(componentType)) {
    const xField = String(binding.xField || binding.labelField || '').trim();
    const yField = String(binding.yField || binding.valueField || '').trim();
    const aggregation = String(binding.aggregation || 'sum').trim();
    if (binding.aggregation && !SAFE_AGGREGATIONS.has(aggregation)) {
      const err = new Error('Invalid aggregation');
      err.status = 400;
      throw err;
    }

    let points;
    if (xField && yField && SAFE_AGGREGATIONS.has(aggregation)) {
      points = groupRows(rows, xField, yField, aggregation).map((item) => ({
        x: item.key,
        y: Number(item.value.toFixed ? item.value.toFixed(2) : item.value)
      }));
    } else if (xField && yField) {
      points = rows.map((row) => ({ x: row[xField], y: Number(row[yField]) || 0 }));
    } else {
      points = [];
    }

    return {
      rawRows: rows,
      data: {
        labels: points.map((item) => item.x),
        series: points.map((item) => item.y),
        segments: points.map((item) => ({ label: item.x, value: item.y })),
        points
      }
    };
  }

  if (componentType === 'kpi_card' || componentType === 'counter' || componentType === 'summary_card') {
    const metricField = String(binding.metricField || binding.yField || '').trim();
    const aggregation = String(binding.aggregation || 'sum').trim();
    if (!metricField || !sourceColumns.includes(metricField)) {
      const err = new Error('KPI metric field is invalid');
      err.status = 400;
      throw err;
    }
    if (!SAFE_AGGREGATIONS.has(aggregation)) {
      const err = new Error('Invalid KPI aggregation');
      err.status = 400;
      throw err;
    }
    const value = aggregate(rows.map((row) => row[metricField]), aggregation);
    return {
      rawRows: rows,
      data: {
        value: Number(value.toFixed ? value.toFixed(2) : value),
        subtitle: `${aggregation.toUpperCase()} of ${metricField}`
      }
    };
  }

  if (componentType === 'table') {
    const requestedColumns = Array.isArray(binding.columns) ? binding.columns : [];
    const columns = requestedColumns.length
      ? requestedColumns.filter((col) => sourceColumns.includes(col))
      : sourceColumns.slice(0, 6);
    const rowValues = rows.map((row) => columns.map((col) => row[col]));
    return {
      rawRows: rows,
      data: {
        columns,
        rows: rowValues
      }
    };
  }

  if (componentType === 'form_select') {
    const optionField = String(binding.optionField || '').trim();
    if (!optionField || !sourceColumns.includes(optionField)) {
      return { rawRows: rows, data: { options: [] } };
    }
    const unique = Array.from(new Set(rows.map((row) => row[optionField]).filter((v) => v != null)));
    return {
      rawRows: rows,
      data: {
        options: unique.map((item) => String(item))
      }
    };
  }

  return { rawRows: rows, data: { rows } };
}

app.get('/api/schema', async (req, res) => {
  try {
    const schema = await db.getSchema();
    res.json({
      tables: schema,
      apiEndpoints: Object.keys(API_DATASETS).map((endpoint) => ({
        id: endpoint,
        label: endpoint.replace('/api/source/', '').replace(/-/g, ' ')
      })),
      operators: Array.from(SAFE_OPERATORS),
      aggregations: Array.from(SAFE_AGGREGATIONS),
      predefinedDatasets: [
        { id: 'student_performance', label: 'Student Performance' },
        { id: 'fees_health', label: 'Fees Health' },
        { id: 'attendance_risk', label: 'Attendance Risk' }
      ]
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || 'Failed to load schema' });
  }
});

app.get('/api/tables', async (req, res) => {
  try {
    const schema = await db.getSchema();
    const tables = schema.map((table) => ({
      name: table.name,
      columns: (table.columns || []).map((col) => col.name)
    }));
    res.json(tables);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || 'Failed to load tables' });
  }
});

app.post('/api/query/execute', async (req, res) => {
  try {
    const payload = req.body || {};
    const componentType = String(payload.componentType || '').trim();
    const binding = payload.binding || {};
    const result = await executeBinding(binding, componentType);
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ ok: false, error: error.message || 'Query execution failed' });
  }
});

app.post('/api/records/:table', async (req, res) => {
  try {
    const table = String(req.params.table || '').trim();
    const payload = req.body || {};
    const columns = await getTableColumns(table);
    if (!columns) return res.status(400).json({ ok: false, error: `Unknown table: ${table}` });

    const clean = {};
    Object.keys(payload).forEach((key) => {
      if (columns.includes(key) && key !== 'id') clean[key] = payload[key];
    });

    const inserted = await db.insertRecord(table, clean);
    return res.status(201).json({ ok: true, record: inserted });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Insert failed' });
  }
});

const ALLOWED_DB_TABLES = new Set([
  'admissions','courses','exams','faculty','hr','library','hostel','transport',
  'placements','research','facilities','inventory','procurement','service_requests',
  'communications','compliance','departments','assignments','leave_requests',
  'announcements','calendar_events','audit_logs','proposals','materials','timetable',
  'attendance_summary','students','fees','attendance','marks','notifications',
  'attendance_uploads'
]);

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function getIdColumn(tableName) {
  const columns = await getTableColumns(tableName);
  if (!columns) return null;
  if (columns.includes('id')) return 'id';
  if (columns.includes('meeting_id')) return 'meeting_id';
  return null;
}

function normalizeTableName(raw) {
  return String(raw || '').trim().toLowerCase();
}

function parseQueryFilters(query, allowedColumns) {
  const filters = [];
  const reserved = new Set(['limit', 'offset', 'order', 'orderby']);
  if (!query) return filters;
  Object.keys(query).forEach((key) => {
    const normKey = String(key || '').trim();
    if (!normKey || reserved.has(normKey.toLowerCase())) return;
    if (!allowedColumns.includes(normKey)) return;
    const raw = query[key];
    if (raw == null || raw === '') return;
    const value = Array.isArray(raw) ? raw : String(raw);
    if (typeof value === 'string' && value.indexOf(',') >= 0) {
      const parts = value.split(',').map((v) => v.trim()).filter(Boolean);
      if (parts.length) {
        filters.push({ field: normKey, op: 'in', value: parts });
      }
    } else {
      filters.push({ field: normKey, op: 'eq', value });
    }
  });
  return filters;
}

async function queryTableWithFilters(table, query) {
  const columns = await getTableColumns(table);
  if (!columns) return { rows: [], columns: [] };
  const filters = parseQueryFilters(query, columns);
  const params = [];
  let sql = `SELECT * FROM ${quoteIdent(table)}`;
  if (filters.length) {
    const clauses = filters.map((f) => {
      if (f.op === 'in') {
        const start = params.length + 1;
        params.push(...f.value);
        const placeholders = f.value.map((_, i) => `$${start + i}`).join(', ');
        return `${quoteIdent(f.field)} IN (${placeholders})`;
      }
      params.push(f.value);
      return `${quoteIdent(f.field)} = $${params.length}`;
    });
    sql += ` WHERE ${clauses.join(' AND ')}`;
  }

  const orderBy = query && query.orderBy && columns.includes(String(query.orderBy)) ? String(query.orderBy) : null;
  const orderDir = String(query && query.order ? query.order : 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  if (orderBy) {
    sql += ` ORDER BY ${quoteIdent(orderBy)} ${orderDir}`;
  }

  if (query && query.limit) {
    const limit = Number(query.limit);
    if (Number.isFinite(limit) && limit > 0) {
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }
  }
  if (query && query.offset) {
    const offset = Number(query.offset);
    if (Number.isFinite(offset) && offset >= 0) {
      params.push(offset);
      sql += ` OFFSET $${params.length}`;
    }
  }

  const result = await db.query(sql, params);
  return { rows: result.rows || [], columns };
}

function buildColumnMap(columns) {
  const map = {};
  columns.forEach((col) => {
    map[String(col).toLowerCase()] = col;
  });
  return map;
}

async function insertRows(table, rows) {
  const columns = await getTableColumns(table);
  if (!columns) return { inserted: [], skipped: 0 };
  const colMap = buildColumnMap(columns);
  const inserted = [];
  let skipped = 0;
  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      skipped += 1;
      continue;
    }
    const keys = Object.keys(row)
      .map((k) => ({ raw: k, norm: String(k).trim().toLowerCase() }))
      .map((k) => ({ raw: k.raw, col: colMap[k.norm] }))
      .filter((k) => k.col);
    if (!keys.length) {
      skipped += 1;
      continue;
    }
    const values = keys.map((k) => row[k.raw]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `
      INSERT INTO ${quoteIdent(table)} (${keys.map((k) => quoteIdent(k.col)).join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;
    const result = await db.query(sql, values);
    if (result.rows && result.rows[0]) inserted.push(result.rows[0]);
  }
  return { inserted, skipped };
}

app.get('/api/db/:table', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const result = await queryTableWithFilters(table, req.query || {});
    return res.json({ ok: true, rows: result.rows || [] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Fetch failed' });
  }
});

app.post('/api/db/:table/bulk', requireAuth(['Admin', 'Faculty']), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const payload = req.body || {};
    const rows = Array.isArray(payload) ? payload : payload.rows;
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ ok: false, error: 'rows array is required' });
    }
    const { inserted, skipped } = await insertRows(table, rows);
    return res.status(201).json({ ok: true, count: inserted.length, skipped, rows: inserted });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Bulk insert failed' });
  }
});

app.post('/api/db/:table/upload', requireAuth(['Admin', 'Faculty']), upload.single('file'), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ ok: false, error: 'file is required' });
    }
    let workbook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer', raw: true });
    } catch (e) {
      return res.status(400).json({ ok: false, error: 'Unable to parse file' });
    }
    const sheetName = workbook.SheetNames && workbook.SheetNames.length ? workbook.SheetNames[0] : null;
    if (!sheetName) {
      return res.status(400).json({ ok: false, error: 'No sheet found' });
    }
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    if (!rows.length) {
      return res.status(400).json({ ok: false, error: 'No rows found in file' });
    }
    const { inserted, skipped } = await insertRows(table, rows);
    return res.status(201).json({
      ok: true,
      count: inserted.length,
      skipped,
      rows: inserted
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Upload failed' });
  }
});

app.get('/api/db/:table/:id', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const idColumn = await getIdColumn(table);
    if (!idColumn) {
      return res.status(400).json({ ok: false, error: 'Table does not support id lookup' });
    }
    const rawId = req.params.id;
    const param = idColumn === 'id' ? Number(rawId) : String(rawId);
    const result = await db.query(
      `SELECT * FROM ${quoteIdent(table)} WHERE ${quoteIdent(idColumn)} = $1 LIMIT 1`,
      [param]
    );
    return res.json({ ok: true, row: result.rows[0] || null });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Fetch failed' });
  }
});

app.post('/api/db/:table', requireAuth(['Admin', 'Faculty']), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const payload = req.body || {};
    const columns = await getTableColumns(table);
    if (!columns) return res.status(400).json({ ok: false, error: 'Unknown table' });
    const keys = Object.keys(payload).filter((key) => columns.includes(key));
    if (!keys.length) return res.status(400).json({ ok: false, error: 'No valid fields provided' });
    const vals = keys.map((k) => payload[k]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `
      INSERT INTO ${quoteIdent(table)} (${keys.map(quoteIdent).join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;
    const result = await db.query(sql, vals);
    return res.status(201).json({ ok: true, row: result.rows[0] || null });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Insert failed' });
  }
});

app.put('/api/db/:table/:id', requireAuth(['Admin', 'Faculty']), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const idColumn = await getIdColumn(table);
    if (!idColumn) {
      return res.status(400).json({ ok: false, error: 'Table does not support id updates' });
    }
    const payload = req.body || {};
    const columns = await getTableColumns(table);
    if (!columns) return res.status(400).json({ ok: false, error: 'Unknown table' });
    const keys = Object.keys(payload).filter((key) => columns.includes(key) && key !== idColumn);
    if (!keys.length) return res.status(400).json({ ok: false, error: 'No valid fields provided' });
    const setSql = keys.map((key, i) => `${quoteIdent(key)} = $${i + 1}`).join(', ');
    const rawId = req.params.id;
    const param = idColumn === 'id' ? Number(rawId) : String(rawId);
    const vals = keys.map((k) => payload[k]);
    vals.push(param);
    const result = await db.query(
      `UPDATE ${quoteIdent(table)} SET ${setSql} WHERE ${quoteIdent(idColumn)} = $${vals.length} RETURNING *;`,
      vals
    );
    return res.json({ ok: true, row: result.rows[0] || null });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Update failed' });
  }
});

app.delete('/api/db/:table/:id', requireAuth(['Admin']), async (req, res) => {
  try {
    const table = normalizeTableName(req.params.table);
    if (!ALLOWED_DB_TABLES.has(table)) {
      return res.status(404).json({ ok: false, error: 'Unknown table' });
    }
    const idColumn = await getIdColumn(table);
    if (!idColumn) {
      return res.status(400).json({ ok: false, error: 'Table does not support id deletes' });
    }
    const rawId = req.params.id;
    const param = idColumn === 'id' ? Number(rawId) : String(rawId);
    await db.query(
      `DELETE FROM ${quoteIdent(table)} WHERE ${quoteIdent(idColumn)} = $1`,
      [param]
    );
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Delete failed' });
  }
});

app.get('/api/app-state', async (req, res) => {
  try {
    const scope = req.headers['x-erp-institute'] || '';
    const state = await erpStateService.getErpState(scope);
    return res.json({ ok: true, state: state || null });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Failed to load app state' });
  }
});

app.post('/api/app-state', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.state || typeof payload.state !== 'object') {
      return res.status(400).json({ ok: false, error: 'state payload is required' });
    }
    const scope = req.headers['x-erp-institute'] || '';
    await erpStateService.setErpState(scope, payload.state);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Failed to save app state' });
  }
});

app.delete('/api/app-state', async (req, res) => {
  try {
    await erpStateService.clearErpState();
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Failed to clear app state' });
  }
});

app.post('/send-emails', async (req, res) => {
  try {
    const { threshold = 75, department } = req.body;
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    console.log(`\n[SEND-EMAILS] ========== EMAIL SEND REQUEST ==========`);
    console.log(`[SEND-EMAILS] Threshold: ${threshold}%`);
    console.log(`[SEND-EMAILS] Department: ${department || 'All'}`);
    console.log(`[SEND-EMAILS] From: ${FROM_EMAIL}`);
    console.log(`[SEND-EMAILS] Transport: SMTP (${SMTP_HOST}:${SMTP_PORT}, secure=${SMTP_SECURE})`);

    // Query students from database
    const studentsResult = await db.query('SELECT * FROM students');
    const studentsData = studentsResult.rows || [];
    console.log(`[SEND-EMAILS] ✓ Found ${studentsData.length} total students in database`);

    // Query attendance data
    const attendanceResult = await db.query('SELECT * FROM attendance');
    const attendanceData = attendanceResult.rows || [];
    console.log(`[SEND-EMAILS] ✓ Found ${attendanceData.length} total attendance records`);

    // Filter students by department and find defaulters
    const defaultersData = studentsData
      .filter(student => !department || student.dept === department)
      .map(student => {
        // Get attendance records for this student
        const studentAttendance = attendanceData.filter(att => att.student_id === student.id);
        
        // Calculate average attendance percentage
        const avgAttendance = studentAttendance.length > 0
          ? studentAttendance.reduce((sum, att) => sum + (att.attendance_pct || 0), 0) / studentAttendance.length
          : student.attendance || 0;
        
        // Ensure email exists (create fallback if null/empty)
        const email = student.email || `${student.name.toLowerCase().replace(/\s+/g, '.')}@unisys.edu`;
        
        console.log(`[SEND-EMAILS] Student: ${student.name} (${student.id}) - Attendance: ${Math.round(avgAttendance)}%`);
        
        return {
          id: student.id,
          name: student.name,
          email: email,
          attendance: Math.round(avgAttendance),
          dept: student.dept,
          class: student.class
        };
      })
      .filter(student => {
        const isDefaulter = student.attendance < threshold;
        if (isDefaulter) {
          console.log(`[SEND-EMAILS] ⚠️  DEFAULTER FOUND: ${student.name} (${student.attendance}% < ${threshold}%)`);
        }
        return isDefaulter;
      });

    console.log(`[SEND-EMAILS] ✓ Found ${defaultersData.length} defaulters to email`);

    if (defaultersData.length === 0) {
      console.log(`[SEND-EMAILS] ⚠️  No defaulters found! Check students table and attendance data.`);
      return res.json({
        success: true,
        message: 'No defaulters found',
        totalStudents: studentsData.length,
        attendanceRecords: attendanceData.length,
        successCount: 0,
        failureCount: 0,
        results: []
      });
    }

    console.log(`[SEND-EMAILS] Starting to send emails to ${defaultersData.length} defaulters (threshold: ${threshold}%)`);

    // Extra recipients for all defaulter alerts
    const EXTRA_RECIPIENTS = [
      'nihalmishra3009@gmail.com',
      'vedhpokharkar@gmail.com',
      'ajinkyarokade4@gmail.com',
      'sprinklestar2619@gmail.com',
      'shahnawaznoor2020@gmail.com'
    ];

    // Send emails to defaulters
    for (const defaulter of defaultersData) {
      try {
        console.log(`[SEND-EMAILS] Attempting to send email to ${defaulter.email}...`);
        
        const emailBody = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; }
                .footer { font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0; color: #c73030;">⚠️ Attendance Alert</h2>
                </div>
                
                <p>Dear <strong>${defaulter.name}</strong>,</p>
                
                <div class="alert">
                  <p><strong>Your current attendance is ${defaulter.attendance}%</strong></p>
                  <p>This is <strong>BELOW</strong> the required threshold of <strong>${threshold}%</strong></p>
                </div>
                
                <p>We are writing to inform you that your attendance in your courses is currently below the minimum required threshold. Regular attendance is crucial for:</p>
                <ul>
                  <li>Academic success and learning outcomes</li>
                  <li>Eligibility for examinations</li>
                  <li>Overall academic progression</li>
                </ul>
                
                <p>Please take immediate action to improve your attendance. If you have any genuine concerns or issues preventing regular attendance, we encourage you to contact:</p>
                <ul>
                  <li><strong>Your Class Mentor</strong></li>
                  <li><strong>Your Department HOD</strong></li>
                </ul>
                
                <p>They may be able to help you address the underlying issues and support your academic journey.</p>
                
                <div class="footer">
                  <p>This is an automated message from the University Management System. Please reply to this email if you have any questions or concerns regarding your attendance.</p>
                  <p><strong>Sent on:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Department:</strong> ${defaulter.dept || 'Not Specified'}</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const response = await mailer.sendMail({
          from: FROM_EMAIL,
          to: defaulter.email,
          bcc: EXTRA_RECIPIENTS,
          subject: `Attendance Alert - Your attendance is ${defaulter.attendance}% (Required: ${threshold}%)`,
          html: emailBody,
          replyTo: FROM_EMAIL
        });

        console.log(`[SEND-EMAILS] ✅ Email sent! MessageId: ${response.messageId}`);
        console.log(`[SEND-EMAILS] Response:`, JSON.stringify(response, null, 2));

        results.push({
          student: defaulter.name,
          email: defaulter.email,
          department: defaulter.dept,
          attendance: defaulter.attendance,
          status: 'sent',
          messageId: response.messageId
        });
        successCount += 1;
      } catch (error) {
        console.error(`[SEND-EMAILS] ❌ Failed to send email:`);
        console.error(`[SEND-EMAILS]   Student: ${defaulter.name}`);
        console.error(`[SEND-EMAILS]   Error: ${error.message}`);
        console.error(`[SEND-EMAILS]   Full error:`, error);
        
        results.push({
          student: defaulter.name,
          email: defaulter.email,
          department: defaulter.dept,
          attendance: defaulter.attendance,
          status: 'failed',
          error: error.message
        });
        failureCount += 1;
      }
    }

    console.log(`[SEND-EMAILS] Complete. Success: ${successCount}, Failed: ${failureCount}`);
    console.log(`[SEND-EMAILS] ==========================================\n`);

    return res.json({
      success: failureCount === 0,
      message: `Emails sent to ${successCount} students, ${failureCount} failed`,
      totalStudents: defaultersData.length,
      successCount,
      failureCount,
      results,
      appliedThreshold: threshold,
      department: department || 'All',
      fromEmail: FROM_EMAIL,
      provider: 'smtp'
    });
  } catch (error) {
    console.error(`[SEND-EMAILS] ❌ FATAL ERROR in /send-emails endpoint:`);
    console.error(`[SEND-EMAILS] Error message:`, error.message);
    console.error(`[SEND-EMAILS] Error details:`, error);
    return res.status(500).json({ success: false, error: error.message, details: error.toString() });
  }
});

app.post('/send-test-email', async (req, res) => {
  try {
    const { to, studentName = 'Student', attendance = 0, threshold = 75, department = 'General' } = req.body || {};
    if (!to || String(to).indexOf('@') === -1) {
      return res.status(400).json({ success: false, error: 'Valid recipient email is required' });
    }

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #c73030; margin-top: 0;">Attendance Alert</h2>
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>Your current attendance is <strong>${attendance}%</strong>, which is below the required threshold of <strong>${threshold}%</strong>.</p>
            <p>Please attend classes regularly and contact your class mentor/HOD if you need support.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;" />
            <p style="font-size: 12px; color: #666;">Department: ${department}</p>
            <p style="font-size: 12px; color: #666;">Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const response = await mailer.sendMail({
      from: FROM_EMAIL,
      to: String(to).trim(),
      subject: `Attendance Alert - Your attendance is ${attendance}% (Required: ${threshold}%)`,
      html,
      replyTo: FROM_EMAIL
    });

    return res.json({
      success: true,
      message: 'Test email sent',
      to: String(to).trim(),
      messageId: response.messageId,
      fromEmail: FROM_EMAIL,
      provider: 'smtp'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message, details: error.toString() });
  }
});

app.get('/health', async (req, res) => {
  try {
    const tables = await db.listTables();
    res.json({
      status: 'Server is running on port 3001',
      schemaTables: tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'DB connection failed', error: error.message });
  }
});

app.use((err, req, res, next) => {
  const msg = err && err.message ? err.message : String(err);
  console.error('[ERROR]', msg);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

async function startServer(port) {
  const usePort = port || PORT;
  try {
    await db.initDatabase();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error('[DB] Unable to initialize database. Continuing without DB.');
    console.error('[DB] Details:', msg);
  }
  try {
    await updateTurnHealth();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.warn('[TURN] Unable to update TURN health:', msg);
  }
  return server.listen(usePort, () => {
    console.log(`Server is running on http://localhost:${usePort}`);
  });
}

if (require.main === module) {
  startServer(PORT).catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer,
  io,
  server
};
