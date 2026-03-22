const express = require('express');
const { requireAuth } = require('../services/auth');
const marksController = require('../controllers/marksController');
const marksService = require('../services/marksService');

function createMarksRouter() {
  const router = express.Router();

  router.get('/:subjectId', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
    const subjectId = req.params.subjectId;
    const marks = await marksService.listMarks(subjectId);
    if (req.user && req.user.role === 'student') {
      const filtered = marks.filter((item) =>
        String(item.studentId || item.student_id || '') === String(req.user.id) ||
        String(item.studentEmail || item.student_email || '') === String(req.user.email || '')
      );
      return res.json({ ok: true, marks: filtered });
    }
    return res.json({ ok: true, marks });
  });

  router.post('/update', requireAuth(['Admin', 'Faculty']), marksController.updateMarks);

  return router;
}

module.exports = createMarksRouter;
