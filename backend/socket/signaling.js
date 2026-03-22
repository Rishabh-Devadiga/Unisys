const meetingStore = require('../utils/meetingStore');
const presenceStore = require('../utils/presenceStore');
const notificationStore = require('../utils/notificationStore');
const createMeetingHub = require('../utils/meetingHub');
const meetingService = require('../services/meetingService');

const meetingHub = createMeetingHub();

function normalizeRoomId(raw) {
  return String(raw || '').trim().toLowerCase();
}

function buildPeerMeta(data, peerId, isCastRoom) {
  const displayName = String(data.displayName || data.display_name || data.name || peerId || '').trim() || peerId;
  const role = String(data.role || '').trim();
  const isHostFlag = Boolean(data.isHost || data.host || data.is_host || role.toLowerCase() === 'host');
  return {
    display_name: displayName,
    role,
    is_host: isHostFlag || isCastRoom
  };
}

function initSignaling(io) {
  function broadcastLobbySnapshot(roomId) {
    meetingHub.broadcastToHosts(io, roomId, {
      type: 'lobby_snapshot',
      peers: meetingHub.listLobby(roomId)
    });
  }

  io.on('connection', (socket) => {
    socket.on('presence:join', (payload) => {
      const data = payload || {};
      const userId = String(data.userId || socket.id).trim();
      const name = String(data.name || userId).trim();
      presenceStore.setOnline(userId, socket.id, name);
      socket.data.presenceUserId = userId;
      io.emit('presence:update', presenceStore.getOnlineSummary());
      socket.emit('notifications:sync', notificationStore.listForUser(userId));
    });

    socket.on('join-room', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const userId = String(data.userId || socket.id).trim();
      const displayName = String(data.name || data.displayName || data.display_name || '').trim();

      if (!meetingId || !meetingStore.hasMeeting(meetingId)) {
        socket.emit('join-error', { message: 'Meeting not found' });
        return;
      }

      socket.join(meetingId);
      socket.data.meetingId = meetingId;
      socket.data.userId = userId;
      meetingStore.addParticipant(meetingId, userId, socket.id, displayName);
      meetingService.addParticipantRecord({
        meetingId,
        userRef: userId
      }).catch(() => {});

      socket.to(meetingId).emit('user-joined', { userId, name: displayName || userId });
      socket.emit('join-success', {
        meetingId,
        userId,
        participants: meetingStore.listParticipants(meetingId).map((participant) => ({
          ...participant,
          name: participant.name || participant.userId
        })),
        screenShareUserId: meetingStore.getScreenShareUserId(meetingId)
      });
    });

    // New meeting signaling (non-breaking; existing events still supported).
    socket.on('meeting:join', (payload) => {
      const data = payload || {};
      const rawRoomId = data.roomId || data.meetingId || data.room_id;
      const roomId = normalizeRoomId(rawRoomId);
      if (!roomId) return;

      const peerId = String(data.peerId || data.peer_id || data.userId || socket.id).trim();
      const isCastRoom = roomId.startsWith('cast-');
      const meta = buildPeerMeta(data, peerId, isCastRoom);
      const useLobby = Boolean(data.useLobby || data.lobby || data.waitForHost);

      socket.data.meetingHubRoomId = roomId;
      socket.data.meetingHubPeerId = peerId;
      socket.data.meetingHubIsCast = isCastRoom;

      if (meta.is_host || isCastRoom || !useLobby) {
        const peers = meetingHub.joinRoom(roomId, peerId, socket.id, meta);
        socket.join(roomId);
        socket.emit('meeting:message', { type: 'peers', peers });
        meetingHub.broadcastExcept(io, roomId, peerId, {
          type: 'peer_joined',
          peer: {
            peer_id: peerId,
            display_name: meta.display_name,
            is_host: meta.is_host,
            role: meta.role || ''
          }
        });
        if (!isCastRoom) broadcastLobbySnapshot(roomId);
      } else {
        meetingHub.joinLobby(roomId, peerId, socket.id, meta);
        socket.emit('meeting:message', {
          type: 'lobby_status',
          status: 'waiting',
          message: 'Waiting for the host to admit you.'
        });
        broadcastLobbySnapshot(roomId);
      }
    });

    socket.on('meeting:message', (payload) => {
      const data = payload || {};
      const roomId = normalizeRoomId(data.roomId || data.meetingId || socket.data.meetingHubRoomId);
      const peerId = String(socket.data.meetingHubPeerId || data.peerId || data.peer_id || data.from || '').trim();
      if (!roomId || !peerId) return;

      const msgType = String(data.type || '').trim();
      const peerState = meetingHub.getPeerState(roomId, peerId);

      if (msgType === 'signal') {
        if (peerState !== 'room') return;
        const targetPeer = String(data.to || '').trim();
        const signalData = data.data;
        if (!targetPeer || !signalData || typeof signalData !== 'object') return;
        meetingHub.send(io, roomId, targetPeer, {
          type: 'signal',
          from: peerId,
          data: signalData
        });
        return;
      }

      if (msgType === 'chat') {
        if (peerState !== 'room') return;
        const text = String(data.text || '').trim();
        const senderName = String(data.sender_name || data.senderName || '').trim() || peerId;
        if (!text) return;
        const outgoing = {
          type: 'chat',
          from: peerId,
          sender_name: senderName,
          text,
          ts: new Date().toISOString()
        };
        meetingHub.broadcastExcept(io, roomId, peerId, outgoing);
        socket.emit('meeting:message', { ...outgoing, is_own: true });
        return;
      }

      if (msgType === 'hand_raise') {
        if (peerState !== 'room') return;
        const raised = Boolean(data.raised);
        const meta = meetingHub.getPeerMeta(roomId, peerId);
        meetingHub.broadcastExcept(io, roomId, peerId, {
          type: 'hand_raise',
          from: peerId,
          display_name: meta.display_name || peerId,
          raised
        });
        return;
      }

      if (msgType === 'reaction') {
        if (peerState !== 'room') return;
        const emoji = String(data.emoji || '').trim();
        if (!emoji) return;
        const meta = meetingHub.getPeerMeta(roomId, peerId);
        meetingHub.broadcastExcept(io, roomId, peerId, {
          type: 'reaction',
          from: peerId,
          display_name: meta.display_name || peerId,
          emoji
        });
        return;
      }

      if (msgType === 'host_action') {
        if (peerState !== 'room') return;
        const meta = meetingHub.getPeerMeta(roomId, peerId);
        if (!meta.is_host) return;
        const action = String(data.action || '').trim();

        if (action === 'mute_all') {
          meetingHub.broadcastExcept(io, roomId, peerId, {
            type: 'control',
            action: 'mute_all',
            from: peerId
          });
          return;
        }

        if (action === 'remove_peer') {
          const targetPeer = String(data.target_peer_id || data.targetPeerId || '').trim();
          if (!targetPeer) return;
          meetingHub.send(io, roomId, targetPeer, {
            type: 'control',
            action: 'remove_self',
            from: peerId
          });
          return;
        }

        if (action === 'admit_peer') {
          const targetPeer = String(data.target_peer_id || data.targetPeerId || '').trim();
          if (!targetPeer) return;
          const admitted = meetingHub.admit(roomId, targetPeer);
          if (!admitted) return;
          if (admitted.entry && admitted.entry.socketId) {
            io.to(admitted.entry.socketId).emit('meeting:message', {
              type: 'admitted',
              message: 'Host admitted you to the meeting.'
            });
            io.to(admitted.entry.socketId).emit('meeting:message', {
              type: 'peers',
              peers: admitted.peers || []
            });
          }
          meetingHub.broadcastExcept(io, roomId, targetPeer, {
            type: 'peer_joined',
            peer: admitted.peer
          });
          broadcastLobbySnapshot(roomId);
          return;
        }

        if (action === 'deny_peer') {
          const targetPeer = String(data.target_peer_id || data.targetPeerId || '').trim();
          if (!targetPeer) return;
          const denied = meetingHub.deny(roomId, targetPeer);
          if (!denied) return;
          if (denied.entry && denied.entry.socketId) {
            io.to(denied.entry.socketId).emit('meeting:message', {
              type: 'lobby_status',
              status: 'denied',
              message: 'Host did not admit you to this meeting.'
            });
          }
          broadcastLobbySnapshot(roomId);
        }
      }
    });

    socket.on('meeting:leave', () => {
      const roomId = normalizeRoomId(socket.data.meetingHubRoomId);
      const peerId = socket.data.meetingHubPeerId;
      if (!roomId || !peerId) return;
      const leftFrom = meetingHub.leave(roomId, peerId);
      if (leftFrom === 'room') {
        meetingHub.broadcastExcept(io, roomId, peerId, { type: 'peer_left', peer_id: peerId });
        socket.leave(roomId);
      }
      if (!socket.data.meetingHubIsCast) broadcastLobbySnapshot(roomId);
      socket.data.meetingHubRoomId = null;
      socket.data.meetingHubPeerId = null;
    });

    socket.on('offer', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const targetId = String(data.targetId || '').trim();
      if (!meetingId || !targetId) return;
      const targetSocketId = meetingStore.getParticipantSocketId(meetingId, targetId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit('offer', {
        meetingId,
        from: data.from || socket.data.userId || socket.id,
        offer: data.offer
      });
    });

    socket.on('answer', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const targetId = String(data.targetId || '').trim();
      if (!meetingId || !targetId) return;
      const targetSocketId = meetingStore.getParticipantSocketId(meetingId, targetId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit('answer', {
        meetingId,
        from: data.from || socket.data.userId || socket.id,
        answer: data.answer
      });
    });

    socket.on('ice-candidate', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const targetId = String(data.targetId || '').trim();
      if (!meetingId || !targetId) return;
      const targetSocketId = meetingStore.getParticipantSocketId(meetingId, targetId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit('ice-candidate', {
        meetingId,
        from: data.from || socket.data.userId || socket.id,
        candidate: data.candidate
      });
    });

    socket.on('screen-share-started', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const userId = String(data.userId || '').trim();
      if (!meetingId || !userId || !meetingStore.hasMeeting(meetingId)) return;
      meetingStore.setScreenShare(meetingId, userId);
      socket.to(meetingId).emit('screen-share-started', { userId });
    });

    socket.on('screen-share-stopped', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const userId = String(data.userId || '').trim();
      if (!meetingId || !meetingStore.hasMeeting(meetingId)) return;
      const current = meetingStore.getScreenShareUserId(meetingId);
      if (!userId || current === userId) {
        meetingStore.setScreenShare(meetingId, null);
        socket.to(meetingId).emit('screen-share-stopped', { userId: current });
      }
    });

    socket.on('leave-room', () => {
      const meetingId = socket.data.meetingId;
      if (!meetingId) return;
      const removed = meetingStore.removeParticipant(meetingId, socket.id);
      if (removed) {
        meetingService.markParticipantLeft({
          meetingId,
          userRef: removed.userId
        }).catch(() => {});
      }
      if (removed && meetingStore.getScreenShareUserId(meetingId) === removed.userId) {
        meetingStore.setScreenShare(meetingId, null);
        socket.to(meetingId).emit('screen-share-stopped', { userId: removed.userId });
      }
      if (removed) socket.to(meetingId).emit('user-left', { userId: removed.userId });
      socket.leave(meetingId);
    });

    socket.on('disconnect', () => {
      const removedUser = presenceStore.setOfflineBySocket(socket.id);
      if (removedUser) {
        io.emit('presence:update', presenceStore.getOnlineSummary());
      }
      const meetingId = socket.data.meetingId;
      if (!meetingId) return;
      const removed = meetingStore.removeParticipant(meetingId, socket.id);
      if (removed) {
        meetingService.markParticipantLeft({
          meetingId,
          userRef: removed.userId
        }).catch(() => {});
      }
      if (removed && meetingStore.getScreenShareUserId(meetingId) === removed.userId) {
        meetingStore.setScreenShare(meetingId, null);
        socket.to(meetingId).emit('screen-share-stopped', { userId: removed.userId });
      }
      if (removed) socket.to(meetingId).emit('user-left', { userId: removed.userId });

      const roomId = normalizeRoomId(socket.data.meetingHubRoomId);
      const peerId = socket.data.meetingHubPeerId;
      if (roomId && peerId) {
        const leftFrom = meetingHub.leave(roomId, peerId);
        if (leftFrom === 'room') {
          meetingHub.broadcastExcept(io, roomId, peerId, { type: 'peer_left', peer_id: peerId });
        }
        if (!socket.data.meetingHubIsCast) broadcastLobbySnapshot(roomId);
      }
    });
  });
}

module.exports = { initSignaling };
