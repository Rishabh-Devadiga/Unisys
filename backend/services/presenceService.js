const presenceStore = require('../utils/presenceStore');

function listPresence() {
  return presenceStore.getOnlineSummary();
}

module.exports = {
  listPresence
};
