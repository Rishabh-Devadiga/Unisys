const express = require('express');
const { requireAuth } = require('../services/auth');
const facultyController = require('../controllers/facultyController');

function createFacultyRouter() {
  const router = express.Router();

  router.get('/', requireAuth(['Admin', 'Faculty']), facultyController.listFaculty);
  router.get('/:id', requireAuth(['Admin', 'Faculty']), facultyController.getFaculty);
  router.post('/', requireAuth(['Admin']), facultyController.createFaculty);

  return router;
}

module.exports = createFacultyRouter;
