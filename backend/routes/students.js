const express = require('express');
const { requireAuth } = require('../services/auth');
const studentsController = require('../controllers/studentsController');
const studentService = require('../services/studentService');

function createStudentsRouter() {
  const router = express.Router();

  router.get('/', requireAuth(['Admin', 'Faculty']), studentsController.listStudents);

  router.get('/:id', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ ok: false, error: 'Student not found' });

    if (req.user && req.user.role === 'student') {
      const canAccess = String(student.id) === String(req.user.id) || String(student.email || '') === String(req.user.email || '');
      if (!canAccess) return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    return res.json({ ok: true, student });
  });

  router.post('/', requireAuth(['Admin']), studentsController.createStudent);

  return router;
}

module.exports = createStudentsRouter;
