const db = require('../../database/db/postgres');

async function listFaculty() {
  const rows = await db.getTableRows('faculty');
  return rows || [];
}

async function getFacultyById(id) {
  const result = await db.query('SELECT * FROM faculty WHERE id = $1', [Number(id)]);
  return result.rows && result.rows[0] ? result.rows[0] : null;
}

async function createFaculty(payload) {
  const clean = {
    id: payload.id || Date.now(),
    name: payload.name || 'Unnamed Faculty',
    dept: payload.dept || 'General',
    desig: payload.desig || payload.role || 'Faculty',
    load: payload.load || 0,
    email: payload.email || '',
    status: payload.status || 'Active',
    leave_balance: payload.leaveBalance || payload.leave_balance || 0,
    courses: payload.courses || []
  };
  return db.insertRecord('faculty', clean);
}

module.exports = {
  listFaculty,
  getFacultyById,
  createFaculty
};
