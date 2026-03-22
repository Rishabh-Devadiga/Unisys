const marksService = require('../services/marksService');

async function listMarks(req, res) {
  try {
    const subjectId = req.params.subjectId || req.query.subjectId || '';
    const marks = await marksService.listMarks(subjectId);
    return res.json({ ok: true, marks });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch marks' });
  }
}

async function updateMarks(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.studentId && !payload.student_id) {
      return res.status(400).json({ ok: false, error: 'studentId is required' });
    }
    if (!payload.subjectId && !payload.subject) {
      return res.status(400).json({ ok: false, error: 'subjectId is required' });
    }
    const record = await marksService.upsertMark(payload);
    return res.status(201).json({ ok: true, record });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to update marks' });
  }
}

module.exports = {
  listMarks,
  updateMarks
};
