const onlineByUser = new Map();
const userBySocket = new Map();

function setOnline(userId, socketId, name) {
  if (!userId || !socketId) return null;
  onlineByUser.set(userId, { socketId, name: name || userId, since: new Date().toISOString() });
  userBySocket.set(socketId, userId);
  return onlineByUser.get(userId);
}

function setOfflineBySocket(socketId) {
  const userId = userBySocket.get(socketId);
  if (!userId) return null;
  userBySocket.delete(socketId);
  const current = onlineByUser.get(userId);
  if (current && current.socketId === socketId) {
    onlineByUser.delete(userId);
  }
  return userId;
}

function getSocketId(userId) {
  const entry = onlineByUser.get(userId);
  return entry ? entry.socketId : null;
}

function getOnlineSummary() {
  const online = {};
  onlineByUser.forEach((val, key) => {
    online[key] = { name: val.name || key, since: val.since };
  });
  return { online };
}

module.exports = {
  setOnline,
  setOfflineBySocket,
  getSocketId,
  getOnlineSummary
};
