const attendanceService = require('../services/attendanceService');

async function listAttendance(req, res) {
  try {
    const classId = req.params.classId || req.query.class || '';
    const attendance = await attendanceService.listAttendanceByClass(classId);
    return res.json({ ok: true, attendance });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch attendance' });
  }
}

async function markAttendance(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.student_id && !payload.studentId) {
      return res.status(400).json({ ok: false, error: 'student_id is required' });
    }
    const record = await attendanceService.markAttendance(payload);
    return res.status(201).json({ ok: true, record });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to mark attendance' });
  }
}

module.exports = {
  listAttendance,
  markAttendance
};
