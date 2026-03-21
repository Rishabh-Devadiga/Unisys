const meetingStore = require('../utils/meetingStore');

function initSignaling(io) {
  io.on('connection', (socket) => {
    socket.on('join-room', (payload) => {
      const data = payload || {};
      const meetingId = String(data.meetingId || '').trim();
      const userId = String(data.userId || socket.id).trim();

      if (!meetingId || !meetingStore.hasMeeting(meetingId)) {
        socket.emit('join-error', { message: 'Meeting not found' });
        return;
      }

      socket.join(meetingId);
      socket.data.meetingId = meetingId;
      socket.data.userId = userId;
      meetingStore.addParticipant(meetingId, userId, socket.id);

      socket.to(meetingId).emit('user-joined', { userId });
      socket.emit('join-success', {
        meetingId,
        userId,
        participants: meetingStore.listParticipants(meetingId)
      });
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

    socket.on('leave-room', () => {
      const meetingId = socket.data.meetingId;
      if (!meetingId) return;
      const removed = meetingStore.removeParticipant(meetingId, socket.id);
      if (removed) socket.to(meetingId).emit('user-left', { userId: removed.userId });
      socket.leave(meetingId);
    });

    socket.on('disconnect', () => {
      const meetingId = socket.data.meetingId;
      if (!meetingId) return;
      const removed = meetingStore.removeParticipant(meetingId, socket.id);
      if (removed) socket.to(meetingId).emit('user-left', { userId: removed.userId });
    });
  });
}

module.exports = { initSignaling };
