const facultyService = require('../services/facultyService');

async function listFaculty(req, res) {
  try {
    const faculty = await facultyService.listFaculty();
    return res.json({ ok: true, faculty });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch faculty' });
  }
}

async function getFaculty(req, res) {
  try {
    const faculty = await facultyService.getFacultyById(req.params.id);
    if (!faculty) return res.status(404).json({ ok: false, error: 'Faculty not found' });
    return res.json({ ok: true, faculty });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch faculty' });
  }
}

async function createFaculty(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.name) {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }
    const faculty = await facultyService.createFaculty(payload);
    return res.status(201).json({ ok: true, faculty });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to create faculty' });
  }
}

module.exports = {
  listFaculty,
  getFaculty,
  createFaculty
};
