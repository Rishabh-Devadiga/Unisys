const db = require('../../database/db/postgres');

function applyFilters(rows, filters) {
  const classId = filters.classId;
  const dept = filters.dept;
  const status = filters.status;
  return rows.filter((row) => {
    if (classId && String(row.class || '') !== classId) return false;
    if (dept && String(row.dept || '') !== dept) return false;
    if (status && String(row.status || '') !== status) return false;
    return true;
  });
}

async function listStudents(filters) {
  const rows = await db.getTableRows('students');
  if (!rows) return [];
  return applyFilters(rows, filters || {});
}

async function getStudentById(id) {
  const result = await db.query('SELECT * FROM students WHERE id = $1', [Number(id)]);
  return result.rows && result.rows[0] ? result.rows[0] : null;
}

async function createStudent(payload) {
  const clean = {
    name: payload.name,
    email: payload.email || null,
    roll: payload.roll || payload.rollNo || payload.roll_no || null,
    class: payload.class || payload.classId || null,
    dept: payload.dept || null,
    year: payload.year || null,
    cgpa: payload.cgpa || null,
    phone: payload.phone || null,
    fees_due: payload.fees_due || payload.feesDue || 0,
    attendance: payload.attendance || 0,
    status: payload.status || 'Active',
    created_at: payload.created_at || payload.createdAt || new Date().toISOString().split('T')[0]
  };
  return db.insertRecord('students', clean);
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent
};
