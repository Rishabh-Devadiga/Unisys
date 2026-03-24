const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../../database/db/postgres');
const { getUserFromSession, getUserFromHeaders } = require('../services/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = String(file && file.originalname ? file.originalname : '');
    if (!/\.xlsx$/i.test(name) && !/\.xls$/i.test(name)) return cb(new Error('Only .xlsx or .xls files are allowed'));
    cb(null, true);
  }
});

function isNonEmptyRow(row) {
  if (!row || !row.length) return false;
  return row.some((cell) => String(cell || '').trim() !== '');
}

function buildHeadersFromData(rows) {
  let maxCols = 0;
  rows.forEach((row) => {
    if (row && row.length > maxCols) maxCols = row.length;
  });
  const headers = [];
  for (let i = 0; i < maxCols; i += 1) {
    if (i === 0) headers.push('Student Name');
    else if (i === 1) headers.push('Attendance');
    else headers.push(`col_${i + 1}`);
  }
  return headers;
}

function findHeaderRow(rows) {
  let headerRowIndex = -1;
  let nameColIndex = -1;
  rows.forEach((row, idx) => {
    if (headerRowIndex !== -1) return;
    if (!isNonEmptyRow(row)) return;
    const cells = (row || []).map((c) => String(c || '').trim().toLowerCase());
    const nameIdx = cells.findIndex((c) => c === 'students name' || c === 'student name' || c === 'name');
    if (nameIdx >= 0) {
      headerRowIndex = idx;
      nameColIndex = nameIdx;
    }
  });
  return { headerRowIndex, nameColIndex };
}

function detectShift(rows, headerRowIndex, totalIdx) {
  if (headerRowIndex < 0 || totalIdx < 0) return 0;
  let shifted = 0;
  let normal = 0;
  for (let i = headerRowIndex + 1; i < Math.min(rows.length, headerRowIndex + 8); i += 1) {
    const row = rows[i] || [];
    if (!isNonEmptyRow(row)) continue;
    const cur = String(row[totalIdx] || '').trim();
    const next = String(row[totalIdx + 1] || '').trim();
    if (!cur && next) shifted += 1;
    if (cur) normal += 1;
  }
  return shifted >= 1 && shifted >= normal ? 1 : 0;
}

function buildAttendanceRecords(rows) {
  if (!rows || rows.length < 1) return [];
  const firstDataIndex = rows.findIndex((row) => isNonEmptyRow(row));
  if (firstDataIndex === -1) return [];

  const headerInfo = findHeaderRow(rows);
  let header = [];
  let startIdx = firstDataIndex;
  let nameCol = 0;

  let totalIdx = -1;
  if (headerInfo.headerRowIndex >= 0) {
    const headerRow = rows[headerInfo.headerRowIndex] || [];
    header = headerRow.map((h, idx) => {
      const val = String(h || '').trim();
      return val || `col_${idx + 1}`;
    });
    totalIdx = header.findIndex((h) => String(h || '').toLowerCase().includes('total lect'));
    startIdx = headerInfo.headerRowIndex + 1;
    nameCol = headerInfo.nameColIndex >= 0 ? headerInfo.nameColIndex : 0;
  } else {
    header = buildHeadersFromData(rows.slice(firstDataIndex));
    startIdx = firstDataIndex;
    nameCol = 0;
  }

  const shift = detectShift(rows, headerInfo.headerRowIndex, totalIdx);

  const records = [];
  for (let i = startIdx; i < rows.length; i += 1) {
    const row = rows[i] || [];
    if (!isNonEmptyRow(row)) continue;
    const nameCell = row[nameCol];
    const studentName = String(nameCell || '').trim();
    if (!studentName) continue;
    const attendance = {};
    for (let c = 1; c < header.length; c += 1) {
      if (c === nameCol) continue;
      const key = header[c] || `col_${c + 1}`;
      const useShift = shift && totalIdx >= 0 && c >= totalIdx;
      const value = row[c + (useShift ? 1 : 0)];
      const keyStr = String(key || '').trim();
      const isLectureCol = /^\d+$/.test(keyStr);
      if (isLectureCol) {
        attendance[keyStr] = typeof value === 'undefined' ? '' : value;
      } else if (typeof value !== 'undefined' && String(value).trim() !== '') {
        attendance[keyStr] = value;
      }
    }
    records.push({ student_name: studentName, attendance });
  }
  return records;
}

function getUploader(req) {
  const user = getUserFromSession(req) || getUserFromHeaders(req);
  if (!user) return 'Unknown';
  return user.name || user.email || 'Unknown';
}

function createAttendanceUploadsRouter() {
  const router = express.Router();

  router.post('/upload-attendance', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ ok: false, error: 'File is required' });
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return res.status(400).json({ ok: false, error: 'No sheets found' });
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
      const records = buildAttendanceRecords(rows);
      if (!records.length) {
        return res.status(400).json({ ok: false, error: 'No attendance records found. Ensure column 1 is Student Name.' });
      }
      const uploadedBy = getUploader(req);
      const now = new Date();
      const sourceFile = String(req.file.originalname || '');
      for (const rec of records) {
        await db.query(
          `INSERT INTO attendance_uploads (student_name, attendance, uploaded_by, upload_date, source_file)
           VALUES ($1, $2, $3, $4, $5)`,
          [rec.student_name, rec.attendance, uploadedBy, now, sourceFile]
        );
      }
      return res.json({ ok: true, inserted: records.length });
    } catch (error) {
      const msg = error && error.message ? error.message : 'Failed to process attendance file';
      return res.status(500).json({ ok: false, error: msg });
    }
  });

  router.get('/attendance-uploads', async (req, res) => {
    try {
      const { rows } = await db.query(
        `SELECT id, student_name, attendance, uploaded_by, upload_date
         FROM attendance_uploads
         ORDER BY upload_date DESC, id DESC`
      );
      return res.json({ ok: true, items: rows || [] });
    } catch (error) {
      return res.status(500).json({ ok: false, error: 'Failed to fetch attendance uploads' });
    }
  });

  return router;
}

module.exports = createAttendanceUploadsRouter;
