const db = require('../../database/db/postgres');
const { v4: uuidv4 } = require('uuid');
const { readListStore, writeListStore } = require('./appStateStore');

const FALLBACK_STORE_ID = 'erp_marks_store';
const MAX_ITEMS = 5000;

async function listMarks(subjectId) {
  try {
    const params = [];
    let sql = 'SELECT * FROM marks';
    if (subjectId) {
      params.push(String(subjectId));
      sql += ` WHERE subject_id = $${params.length}`;
    }
    sql += ' ORDER BY recorded_at DESC';
    const result = await db.query(sql, params);
    return result.rows || [];
  } catch (e) {
    const store = await readListStore(FALLBACK_STORE_ID);
    if (!subjectId) return store.items;
    return store.items.filter((item) => String(item.subjectId || '') === String(subjectId));
  }
}

async function upsertMark(payload) {
  const subjectId = String(payload.subjectId || payload.subject || '').trim();
  const studentId = payload.studentId || payload.student_id || null;
  const record = {
    id: uuidv4(),
    studentId: studentId ? Number(studentId) : null,
    studentName: payload.studentName || payload.student_name || '',
    studentEmail: payload.studentEmail || payload.student_email || payload.email || '',
    subjectId: subjectId || null,
    subject: payload.subject || '',
    marks: Number(payload.marks || 0),
    maxMarks: Number(payload.maxMarks || payload.max_marks || 100),
    grade: payload.grade || '',
    exam: payload.exam || '',
    class: payload.class || payload.classId || '',
    dept: payload.dept || '',
    updatedAt: new Date().toISOString()
  };
  try {
    await db.query(
      `INSERT INTO marks (student_id, subject_id, subject, marks, max_marks, grade, exam, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (student_id, subject_id)
       DO UPDATE SET subject = EXCLUDED.subject,
                     marks = EXCLUDED.marks,
                     max_marks = EXCLUDED.max_marks,
                     grade = EXCLUDED.grade,
                     exam = EXCLUDED.exam,
                     updated_at = NOW()`,
      [
        record.studentId,
        record.subjectId,
        record.subject,
        record.marks,
        record.maxMarks,
        record.grade,
        record.exam
      ]
    );
  } catch (e) {
    const store = await readListStore(FALLBACK_STORE_ID);
    const existing = store.items.find((item) =>
      String(item.subjectId || '') === String(record.subjectId) &&
      String(item.studentId || '') === String(record.studentId)
    );
    if (existing) Object.assign(existing, record);
    else store.items.unshift(record);
    if (store.items.length > MAX_ITEMS) store.items.length = MAX_ITEMS;
    await writeListStore(FALLBACK_STORE_ID, store);
  }
  return record;
}

module.exports = {
  listMarks,
  upsertMark
};
