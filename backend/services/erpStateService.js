const db = require('../../database/db/postgres');

function normalizeScope(scope) {
  return String(scope || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function buildStateId(scope) {
  const safe = normalizeScope(scope);
  return safe ? `erp_state:${safe}` : 'erp_state:default';
}

async function getErpState(scope) {
  const state = await db.getAppState(buildStateId(scope));
  return state && typeof state === 'object' ? state : null;
}

async function setErpState(scope, state) {
  if (!state || typeof state !== 'object') return null;
  await db.setAppState(buildStateId(scope), state);
  return state;
}

module.exports = {
  getErpState,
  setErpState
};
