const express = require('express');
const { requireAuth } = require('../services/auth');
const notificationsController = require('../controllers/notificationsController');
const notificationsService = require('../services/notificationsService');
const notificationStore = require('../utils/notificationStore');

function createNotificationsRouter(io) {
  const router = express.Router();

  router.get('/', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
    const userId = req.query.userId || (req.user ? req.user.id : '');
    const notifications = await notificationsService.listNotifications(userId);
    return res.json({ ok: true, notifications });
  });

  router.post('/', requireAuth(['Admin', 'Faculty']), async (req, res) => {
    const payload = req.body || {};
    const notification = await notificationsService.createNotification(payload);
    notificationStore.addNotification(notification);

    if (io) {
      if (notification.userId) {
        io.to(`user:${notification.userId}`).emit('notification', notification);
      } else {
        io.emit('notification', notification);
      }
    }
    return res.status(201).json({ ok: true, notification });
  });

  router.post('/read', requireAuth(['Admin', 'Faculty', 'Student']), async (req, res) => {
    const payload = req.body || {};
    const id = payload.id || payload.notificationId;
    if (!id) return res.status(400).json({ ok: false, error: 'id is required' });
    const userId = req.user ? req.user.id || req.user.email : null;
    const result = await notificationsService.markNotificationRead(id, userId);
    if (!result.ok) return res.status(500).json({ ok: false, error: result.error || 'Failed' });
    return res.json({ ok: true });
  });

  return router;
}

module.exports = createNotificationsRouter;
