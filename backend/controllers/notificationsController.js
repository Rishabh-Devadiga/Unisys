const notificationsService = require('../services/notificationsService');

async function listNotifications(req, res) {
  try {
    const userId = req.query.userId || '';
    const notifications = await notificationsService.listNotifications(userId);
    return res.json({ ok: true, notifications });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch notifications' });
  }
}

async function createNotification(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.title && !payload.message) {
      return res.status(400).json({ ok: false, error: 'title or message is required' });
    }
    const notification = await notificationsService.createNotification(payload);
    return res.status(201).json({ ok: true, notification });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to create notification' });
  }
}

module.exports = {
  listNotifications,
  createNotification
};
