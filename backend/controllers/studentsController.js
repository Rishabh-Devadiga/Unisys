const studentService = require('../services/studentService');

async function listStudents(req, res) {
  try {
    const filters = {
      classId: req.query.class || req.query.classId || '',
      dept: req.query.dept || '',
      status: req.query.status || ''
    };
    const students = await studentService.listStudents(filters);
    return res.json({ ok: true, students });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch students' });
  }
}

async function getStudent(req, res) {
  try {
    const id = req.params.id;
    const student = await studentService.getStudentById(id);
    if (!student) return res.status(404).json({ ok: false, error: 'Student not found' });
    return res.json({ ok: true, student });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch student' });
  }
}

async function createStudent(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.name) {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }
    const student = await studentService.createStudent(payload);
    return res.status(201).json({ ok: true, student });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to create student' });
  }
}

module.exports = {
  listStudents,
  getStudent,
  createStudent
};
