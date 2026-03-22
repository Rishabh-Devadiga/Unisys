const express = require('express');
const { requireAuth } = require('../services/auth');
const presenceController = require('../controllers/presenceController');

function createPresenceRouter() {
  const router = express.Router();
  router.get('/', requireAuth(['Admin', 'Faculty', 'Student']), presenceController.listPresence);
  return router;
}

module.exports = createPresenceRouter;
