const express = require('express');
const { requireAuth } = require('../services/auth');
const attendanceController = require('../controllers/attendanceController');

function createAttendanceRouter() {
  const router = express.Router();

  router.post('/mark', requireAuth(['Admin', 'Faculty']), attendanceController.markAttendance);
  router.get('/:classId', requireAuth(['Admin', 'Faculty']), attendanceController.listAttendance);

  return router;
}

module.exports = createAttendanceRouter;
