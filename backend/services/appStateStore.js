const db = require('../../database/db/postgres');

async function readStore(id, fallback) {
  const data = await db.getAppState(id);
  if (!data || typeof data !== 'object') {
    return fallback && typeof fallback === 'object' ? fallback : {};
  }
  return data;
}

async function writeStore(id, payload) {
  await db.setAppState(id, payload || {});
  return payload || {};
}

async function readListStore(id) {
  const store = await readStore(id, { items: [], updatedAt: new Date().toISOString() });
  if (!Array.isArray(store.items)) store.items = [];
  return store;
}

async function writeListStore(id, store) {
  const payload = store && typeof store === 'object' ? store : { items: [] };
  payload.updatedAt = new Date().toISOString();
  await writeStore(id, payload);
  return payload;
}

module.exports = {
  readStore,
  writeStore,
  readListStore,
  writeListStore
};
