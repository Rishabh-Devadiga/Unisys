const express = require('express');
const { requireAuth, getUserFromSession, getUserFromHeaders } = require('../services/auth');
const erpStateService = require('../services/erpStateService');

function createErpStateRouter() {
  const router = express.Router();

  router.get('/', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
    try {
      const user = getUserFromSession(req) || getUserFromHeaders(req) || {};
      const scope = req.headers['x-erp-institute'] || user.institute || '';
      const state = await erpStateService.getErpState(scope);
      return res.json({ ok: true, state: state || null });
    } catch (e) {
      return res.status(500).json({ ok: false, error: 'Failed to load ERP state' });
    }
  });

  router.post('/', requireAuth(['Admin', 'Faculty']), async (req, res) => {
    try {
      const payload = req.body || {};
      if (!payload.state || typeof payload.state !== 'object') {
        return res.status(400).json({ ok: false, error: 'state payload is required' });
      }
      const user = getUserFromSession(req) || getUserFromHeaders(req) || {};
      const scope = req.headers['x-erp-institute'] || user.institute || '';
      await erpStateService.setErpState(scope, payload.state);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: 'Failed to save ERP state' });
    }
  });

  return router;
}

module.exports = createErpStateRouter;
