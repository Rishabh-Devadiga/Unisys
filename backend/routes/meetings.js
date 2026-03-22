const express = require('express');
const meetingStore = require('../utils/meetingStore');
const notificationStore = require('../utils/notificationStore');
const presenceStore = require('../utils/presenceStore');

function scheduleReminder(io, meeting) {
  if (!meeting || !meeting.scheduledAt) return;
  const start = new Date(meeting.scheduledAt).getTime();
  if (!Number.isFinite(start)) return;
  const delay = start - Date.now() - 10 * 60 * 1000;
  const fireReminder = () => {
    const notif = notificationStore.addNotification({
      title: 'Meeting Reminder',
      message: 'Meeting starting in 10 minutes',
      meetingId: meeting.meetingId
    });
    if (io) io.emit('notification', notif);
  };
  if (delay <= 0) setTimeout(fireReminder, 1000);
  else setTimeout(fireReminder, delay);
}

function createMeetingsRouter(io) {
  const router = express.Router();

  // Create a new meeting
  router.post('/create', (req, res) => {
    const payload = req.body || {};
    const meeting = meetingStore.createMeeting({ hostId: payload.hostId });
    return res.status(201).json({ meetingId: meeting.meetingId });
  });

  // Schedule a meeting
  router.post('/schedule', (req, res) => {
    const payload = req.body || {};
    const title = String(payload.title || '').trim();
    const date = String(payload.date || '').trim();
    const time = String(payload.time || '').trim();
    const description = String(payload.description || '').trim();
    if (!title || !date || !time) {
      return res.status(400).json({ error: 'title, date, and time are required' });
    }
    const scheduledAt = new Date(date + 'T' + time);
    if (!Number.isFinite(scheduledAt.getTime())) {
      return res.status(400).json({ error: 'Invalid date/time' });
    }
    const meeting = meetingStore.scheduleMeeting({
      title,
      date,
      time,
      description,
      scheduledAt: scheduledAt.toISOString()
    });

    const notif = notificationStore.addNotification({
      title: 'New Meeting Scheduled',
      message: `${title} meeting scheduled at ${time}`,
      meetingId: meeting.meetingId
    });
    if (io) io.emit('notification', notif);
    scheduleReminder(io, meeting);

    return res.status(201).json({ meetingId: meeting.meetingId });
  });

  // Invite user to meeting
  router.post('/invite', (req, res) => {
    const payload = req.body || {};
    const meetingId = String(payload.meetingId || '').trim();
    const invitedUserId = String(payload.invitedUserId || '').trim();
    const invitedBy = String(payload.invitedBy || 'Host').trim();
    if (!meetingId || !invitedUserId) {
      return res.status(400).json({ error: 'meetingId and invitedUserId are required' });
    }
    meetingStore.addInvite(meetingId, invitedUserId, invitedBy);
    const notif = notificationStore.addNotification({
      title: 'Meeting Invite',
      message: `${invitedBy} invited you to a meeting`,
      meetingId,
      userId: invitedUserId
    });
    if (io) {
      const socketId = presenceStore.getSocketId(invitedUserId);
      if (socketId) io.to(socketId).emit('notification', notif);
    }
    return res.json({ ok: true });
  });

  // Get meeting metadata
  router.get('/:meetingId', (req, res) => {
    const meetingId = String(req.params.meetingId || '').trim();
    const meeting = meetingStore.getMeeting(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    return res.json({
      meetingId: meeting.meetingId,
      participants: meeting.participants.length,
      hostId: meeting.hostId,
      createdAt: meeting.createdAt
    });
  });

  return router;
}

module.exports = createMeetingsRouter;
