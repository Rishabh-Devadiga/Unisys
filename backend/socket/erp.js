const notificationStore = require('../utils/notificationStore');
const presenceStore = require('../utils/presenceStore');
const meetingService = require('../services/meetingService');
const notificationsService = require('../services/notificationsService');

function initErpSockets(io) {
  if (!io) return;

  io.on('connection', (socket) => {
    socket.on('presence:join', (payload) => {
      const data = payload || {};
      const userId = String(data.userId || '').trim();
      const name = String(data.name || userId).trim();
      if (!userId) return;
      presenceStore.setOnline(userId, socket.id, name);
      socket.join(`user:${userId}`);
      io.emit('presence:update', presenceStore.getOnlineSummary());
    });

    socket.on('presence:leave', () => {
      const userId = presenceStore.setOfflineBySocket(socket.id);
      if (userId) io.emit('presence:update', presenceStore.getOnlineSummary());
    });

    socket.on('notifications:subscribe', (payload) => {
      const userId = payload && payload.userId ? String(payload.userId) : '';
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('meeting:invite', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const invitedUserId = String(data.invitedUserId || '').trim();
      const invitedBy = String(data.invitedBy || 'Host').trim();
      if (!meetingId || !invitedUserId) return;
      meetingService
        .addInviteRecord({
          meetingId,
          invitedUserRef: invitedUserId,
          invitedByRef: invitedBy
        })
        .catch(() => {});
      notificationsService
        .createNotification({
          title: 'Meeting Invite',
          message: `${invitedBy} invited you to a meeting`,
          meetingId,
          userRef: invitedUserId
        })
        .then((notif) => {
          notificationStore.addNotification(notif);
          io.to(`user:${invitedUserId}`).emit('meeting:invite', {
            meetingId,
            invitedBy
          });
          io.to(`user:${invitedUserId}`).emit('notification', notif);
        })
        .catch(() => {});
    });

    socket.on('disconnect', () => {
      const userId = presenceStore.setOfflineBySocket(socket.id);
      if (userId) io.emit('presence:update', presenceStore.getOnlineSummary());
    });
  });
}

module.exports = { initErpSockets };
