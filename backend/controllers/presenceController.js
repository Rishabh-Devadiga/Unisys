const presenceService = require('../services/presenceService');

async function listPresence(req, res) {
  try {
    const summary = presenceService.listPresence();
    return res.json({ ok: true, presence: summary });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch presence' });
  }
}

module.exports = {
  listPresence
};
