const { v4: uuidv4 } = require('uuid');

const notifications = [];
const MAX_NOTIFICATIONS = 200;

function addNotification(payload) {
  const data = payload || {};
  const item = {
    id: data.id || uuidv4(),
    title: data.title || 'Notification',
    message: data.message || '',
    time: data.time || 'Just now',
    meetingId: data.meetingId || null,
    userId: data.userId || null,
    createdAt: new Date().toISOString(),
    read: !!data.read
  };
  notifications.unshift(item);
  if (notifications.length > MAX_NOTIFICATIONS) notifications.length = MAX_NOTIFICATIONS;
  return item;
}

function listForUser(userId) {
  if (!userId) return notifications.slice();
  return notifications.filter((n) => !n.userId || n.userId === userId).slice(0, MAX_NOTIFICATIONS);
}

module.exports = {
  addNotification,
  listForUser
};
