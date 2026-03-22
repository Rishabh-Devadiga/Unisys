const db = require('../../database/db/postgres');

async function listAttendanceByClass(classId) {
  const rows = await db.getTableRows('attendance');
  if (!rows) return [];
  if (!classId) return rows;
  return rows.filter((row) => String(row.class || '') === String(classId));
}

async function markAttendance(payload) {
  const clean = {
    student_id: payload.student_id || payload.studentId || null,
    student_name: payload.student_name || payload.studentName || null,
    class: payload.class || payload.classId || null,
    month: payload.month || null,
    attendance_pct: payload.attendance_pct || payload.attendancePct || 0,
    present_days: payload.present_days || payload.presentDays || 0,
    total_days: payload.total_days || payload.totalDays || 0
  };
  let aggregate = null;
  try {
    aggregate = await db.insertRecord('attendance', clean);
  } catch (e) {
    aggregate = null;
  }

  try {
    await db.query(
      `INSERT INTO attendance_records (student_id, class, date, status, marked_by, marked_by_ref)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clean.student_id ? Number(clean.student_id) : null,
        clean.class,
        payload.date || new Date().toISOString().split('T')[0],
        payload.status || 'Present',
        payload.marked_by ? Number(payload.marked_by) : null,
        payload.marked_by_ref || payload.markedBy || null
      ]
    );
  } catch (e) {
    // ignore record insert failures to avoid breaking existing flow
  }

  return aggregate || clean;
}

module.exports = {
  listAttendanceByClass,
  markAttendance
};
