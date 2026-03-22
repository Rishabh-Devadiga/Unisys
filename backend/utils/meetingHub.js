function createMeetingHub() {
  const rooms = new Map();
  const lobbies = new Map();

  function getRoom(map, roomId) {
    let room = map.get(roomId);
    if (!room) {
      room = new Map();
      map.set(roomId, room);
    }
    return room;
  }

  function peerPayload(peerId, entry) {
    const meta = (entry && entry.meta) || {};
    return {
      peer_id: peerId,
      display_name: meta.display_name || peerId,
      is_host: Boolean(meta.is_host),
      role: meta.role || ''
    };
  }

  function joinRoom(roomId, peerId, socketId, meta) {
    const lobby = lobbies.get(roomId);
    if (lobby) {
      lobby.delete(peerId);
      if (!lobby.size) lobbies.delete(roomId);
    }
    const room = getRoom(rooms, roomId);
    const peers = [];
    room.forEach((entry, pid) => {
      peers.push(peerPayload(pid, entry));
    });
    room.set(peerId, { socketId, meta });
    return peers;
  }

  function joinLobby(roomId, peerId, socketId, meta) {
    const room = rooms.get(roomId);
    if (room) {
      room.delete(peerId);
      if (!room.size) rooms.delete(roomId);
    }
    const lobby = getRoom(lobbies, roomId);
    lobby.set(peerId, { socketId, meta });
  }

  function leave(roomId, peerId) {
    const room = rooms.get(roomId);
    if (room && room.has(peerId)) {
      room.delete(peerId);
      if (!room.size) rooms.delete(roomId);
      return 'room';
    }
    const lobby = lobbies.get(roomId);
    if (lobby && lobby.has(peerId)) {
      lobby.delete(peerId);
      if (!lobby.size) lobbies.delete(roomId);
      return 'lobby';
    }
    return null;
  }

  function send(io, roomId, peerId, payload) {
    const entry = (rooms.get(roomId) || new Map()).get(peerId)
      || (lobbies.get(roomId) || new Map()).get(peerId);
    if (!entry || !entry.socketId) return;
    io.to(entry.socketId).emit('meeting:message', payload);
  }

  function broadcastExcept(io, roomId, excludePeerId, payload) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.forEach((entry, pid) => {
      if (pid === excludePeerId) return;
      if (!entry.socketId) return;
      io.to(entry.socketId).emit('meeting:message', payload);
    });
  }

  function broadcastToHosts(io, roomId, payload) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.forEach((entry) => {
      if (!entry || !entry.meta || !entry.meta.is_host) return;
      if (!entry.socketId) return;
      io.to(entry.socketId).emit('meeting:message', payload);
    });
  }

  function getPeerMeta(roomId, peerId) {
    const entry = (rooms.get(roomId) || new Map()).get(peerId)
      || (lobbies.get(roomId) || new Map()).get(peerId);
    return { ...(entry && entry.meta ? entry.meta : {}) };
  }

  function getPeerState(roomId, peerId) {
    if (rooms.get(roomId) && rooms.get(roomId).has(peerId)) return 'room';
    if (lobbies.get(roomId) && lobbies.get(roomId).has(peerId)) return 'lobby';
    return null;
  }

  function listLobby(roomId) {
    const lobby = lobbies.get(roomId);
    if (!lobby) return [];
    const peers = [];
    lobby.forEach((entry, pid) => {
      peers.push(peerPayload(pid, entry));
    });
    return peers;
  }

  function admit(roomId, peerId) {
    const lobby = lobbies.get(roomId);
    if (!lobby) return null;
    const entry = lobby.get(peerId);
    if (!entry) return null;
    lobby.delete(peerId);
    if (!lobby.size) lobbies.delete(roomId);
    const room = getRoom(rooms, roomId);
    const peers = [];
    room.forEach((activeEntry, pid) => {
      peers.push(peerPayload(pid, activeEntry));
    });
    room.set(peerId, entry);
    return { entry, peer: peerPayload(peerId, entry), peers };
  }

  function deny(roomId, peerId) {
    const lobby = lobbies.get(roomId);
    if (!lobby) return null;
    const entry = lobby.get(peerId);
    if (!entry) return null;
    lobby.delete(peerId);
    if (!lobby.size) lobbies.delete(roomId);
    return { entry, peer: peerPayload(peerId, entry) };
  }

  function listPeers(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];
    const peers = [];
    room.forEach((entry, pid) => peers.push(peerPayload(pid, entry)));
    return peers;
  }

  return {
    joinRoom,
    joinLobby,
    leave,
    send,
    broadcastExcept,
    broadcastToHosts,
    getPeerMeta,
    getPeerState,
    listLobby,
    admit,
    deny,
    listPeers
  };
}

module.exports = createMeetingHub;
