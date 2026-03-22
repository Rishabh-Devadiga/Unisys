const { v4: uuidv4 } = require('uuid');
const db = require('../../database/db/postgres');
const { readListStore, writeListStore } = require('./appStateStore');

const FALLBACK_STORE_ID = 'erp_notifications_store';
const MAX_ITEMS = 500;

async function listNotifications(userId) {
  try {
    const params = [];
    let sql = 'SELECT * FROM notifications';
    if (userId) {
      const numericId = String(userId).match(/^\d+$/) ? Number(userId) : null;
      params.push(userId);
      if (numericId != null) params.push(numericId);
      sql += numericId != null
        ? ` WHERE user_ref = $1 OR user_id = $2`
        : ` WHERE user_ref = $1`;
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const result = await db.query(sql, params);
    return result.rows || [];
  } catch (e) {
    const store = await readListStore(FALLBACK_STORE_ID);
    if (!userId) return store.items;
    return store.items.filter((item) => !item.userId || String(item.userId) === String(userId));
  }
}

async function createNotification(payload) {
  const resolvedUserId = payload.userId || payload.userRef || null;
  const item = {
    id: payload.id || uuidv4(),
    title: payload.title || 'Notification',
    message: payload.message || '',
    userId: resolvedUserId,
    userRef: payload.userRef || payload.userId || resolvedUserId || null,
    meetingId: payload.meetingId || null,
    readStatus: !!payload.readStatus || !!payload.read
  };
  try {
    await db.query(
      `INSERT INTO notifications (id, user_id, user_ref, title, message, read_status, meeting_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        item.id,
        item.userId && String(item.userId).match(/^\d+$/) ? Number(item.userId) : null,
        item.userRef ? String(item.userRef) : null,
        item.title,
        item.message,
        item.readStatus,
        item.meetingId ? String(item.meetingId) : null
      ]
    );
  } catch (e) {
    const store = await readListStore(FALLBACK_STORE_ID);
    const fallback = {
      id: item.id,
      title: item.title,
      message: item.message,
      userId: item.userId,
      meetingId: item.meetingId,
      createdAt: new Date().toISOString(),
      read: item.readStatus
    };
    store.items.unshift(fallback);
    if (store.items.length > MAX_ITEMS) store.items.length = MAX_ITEMS;
    await writeListStore(FALLBACK_STORE_ID, store);
  }

  return {
    id: item.id,
    title: item.title,
    message: item.message,
    userId: item.userId,
    meetingId: item.meetingId,
    readStatus: item.readStatus,
    createdAt: new Date().toISOString()
  };
}

async function markNotificationRead(id, userId) {
  if (!id) return { ok: false, error: 'id required' };
  try {
    const params = [String(id)];
    let sql = 'UPDATE notifications SET read_status = TRUE WHERE id = $1';
    if (userId) {
      const numericId = String(userId).match(/^\d+$/) ? Number(userId) : null;
      params.push(String(userId));
      if (numericId != null) params.push(numericId);
      sql += numericId != null
        ? ` AND (user_ref = $2 OR user_id = $3)`
        : ` AND user_ref = $2`;
    }
    await db.query(sql, params);
    return { ok: true };
  } catch (e) {
    try {
      const store = await readListStore(FALLBACK_STORE_ID);
      const target = store.items.find((item) => String(item.id) === String(id));
      if (target) target.read = true;
      await writeListStore(FALLBACK_STORE_ID, store);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Failed to mark read' };
    }
  }
}

module.exports = {
  listNotifications,
  createNotification,
  markNotificationRead
};
