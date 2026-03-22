const { v4: uuidv4 } = require('uuid');
const { readListStore, writeListStore } = require('./appStateStore');

const STORE_ID = 'erp_faculty_store';
const MAX_ITEMS = 1000;

async function listFaculty() {
  const store = await readListStore(STORE_ID);
  return store.items;
}

async function getFacultyById(id) {
  const store = await readListStore(STORE_ID);
  return store.items.find((item) => String(item.id) === String(id)) || null;
}

async function createFaculty(payload) {
  const store = await readListStore(STORE_ID);
  const item = {
    id: payload.id || uuidv4(),
    name: payload.name || 'Unnamed Faculty',
    dept: payload.dept || 'General',
    role: payload.role || 'Faculty',
    email: payload.email || '',
    status: payload.status || 'Active',
    joinDate: payload.joinDate || new Date().toISOString().split('T')[0]
  };
  store.items.unshift(item);
  if (store.items.length > MAX_ITEMS) store.items.length = MAX_ITEMS;
  await writeListStore(STORE_ID, store);
  return item;
}

module.exports = {
  listFaculty,
  getFacultyById,
  createFaculty
};
