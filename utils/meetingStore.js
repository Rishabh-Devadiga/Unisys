const { v4: uuidv4 } = require('uuid');

const meetings = new Map();

function createMeeting(options) {
  const opts = options || {};
  const meetingId = uuidv4();
  const meeting = {
    meetingId,
    hostId: opts.hostId || null,
    createdAt: new Date().toISOString(),
    participants: [],
    screenShareUserId: null
  };
  meetings.set(meetingId, meeting);
  return meeting;
}

function getMeeting(meetingId) {
  return meetings.get(meetingId) || null;
}

function hasMeeting(meetingId) {
  return meetings.has(meetingId);
}

function addParticipant(meetingId, userId, socketId) {
  const meeting = getMeeting(meetingId);
  if (!meeting) return null;
  const existing = meeting.participants.find((p) => p.socketId === socketId || p.userId === userId);
  if (existing) return existing;
  const participant = {
    userId: userId || socketId,
    socketId,
    joinedAt: new Date().toISOString()
  };
  meeting.participants.push(participant);
  return participant;
}

function removeParticipant(meetingId, socketId) {
  const meeting = getMeeting(meetingId);
  if (!meeting) return null;
  const idx = meeting.participants.findIndex((p) => p.socketId === socketId);
  if (idx === -1) return null;
  const removed = meeting.participants.splice(idx, 1)[0];
  return removed || null;
}

function getParticipantSocketId(meetingId, targetId) {
  const meeting = getMeeting(meetingId);
  if (!meeting) return null;
  const bySocket = meeting.participants.find((p) => p.socketId === targetId);
  if (bySocket) return bySocket.socketId;
  const byUser = meeting.participants.find((p) => p.userId === targetId);
  return byUser ? byUser.socketId : null;
}

function countParticipants(meetingId) {
  const meeting = getMeeting(meetingId);
  return meeting ? meeting.participants.length : 0;
}

function listParticipants(meetingId) {
  const meeting = getMeeting(meetingId);
  return meeting ? meeting.participants.slice() : [];
}

function setScreenShare(meetingId, userId) {
  const meeting = getMeeting(meetingId);
  if (!meeting) return null;
  meeting.screenShareUserId = userId || null;
  return meeting.screenShareUserId;
}

function getScreenShareUserId(meetingId) {
  const meeting = getMeeting(meetingId);
  return meeting ? meeting.screenShareUserId : null;
}

module.exports = {
  createMeeting,
  getMeeting,
  hasMeeting,
  addParticipant,
  removeParticipant,
  getParticipantSocketId,
  countParticipants,
  listParticipants,
  setScreenShare,
  getScreenShareUserId
};
