const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const db = require('./db/postgres');
const createMeetingsRouter = require('./routes/meetings');
const { initSignaling } = require('./socket/signaling');

const app = express();
const PORT = 3001;

// SMTP configuration (Gmail App Password)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || 'edusysalert@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'ytkhwobzikmobjyn';
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

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
initSignaling(io);
app.use('/api/meetings', createMeetingsRouter(io));

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

async function startServer(port) {
  const usePort = port || PORT;
  try {
    await db.initDatabase();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error('[DB] Unable to initialize database. Continuing without DB.');
    console.error('[DB] Details:', msg);
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
