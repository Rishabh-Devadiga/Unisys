const { v4: uuidv4 } = require('uuid');

const meetings = new Map();
const scheduledMeetings = new Map();
const meetingInvites = new Map();

function createMeeting(options) {
  const opts = options || {};
  const meetingId = opts.meetingId || uuidv4();
  const meeting = {
    meetingId,
    hostId: opts.hostId || null,
    createdAt: new Date().toISOString(),
    scheduledAt: opts.scheduledAt || null,
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

function scheduleMeeting(options) {
  const opts = options || {};
  const meetingId = opts.meetingId || uuidv4();
  const scheduledAt = opts.scheduledAt || null;
  if (!meetings.has(meetingId)) {
    createMeeting({ hostId: opts.hostId, meetingId, scheduledAt });
  }
  const record = {
    meetingId,
    title: opts.title || 'Scheduled Meeting',
    date: opts.date || '',
    time: opts.time || '',
    description: opts.description || '',
    hostId: opts.hostId || null,
    scheduledAt: scheduledAt,
    createdAt: new Date().toISOString()
  };
  scheduledMeetings.set(meetingId, record);
  return record;
}

function getScheduledMeeting(meetingId) {
  return scheduledMeetings.get(meetingId) || null;
}

function listScheduledMeetings() {
  return Array.from(scheduledMeetings.values());
}

function addInvite(meetingId, invitedUserId, invitedBy) {
  if (!meetingId || !invitedUserId) return null;
  const invites = meetingInvites.get(meetingId) || [];
  const invite = {
    meetingId,
    invitedUserId,
    invitedBy: invitedBy || null,
    invitedAt: new Date().toISOString()
  };
  invites.push(invite);
  meetingInvites.set(meetingId, invites);
  return invite;
}

function listInvites(meetingId) {
  return meetingInvites.get(meetingId) || [];
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
  getScreenShareUserId,
  scheduleMeeting,
  getScheduledMeeting,
  listScheduledMeetings,
  addInvite,
  listInvites
};
