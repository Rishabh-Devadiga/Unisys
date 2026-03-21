const express = require('express');
const meetingStore = require('../utils/meetingStore');

const router = express.Router();

// Create a new meeting
router.post('/create', (req, res) => {
  const payload = req.body || {};
  const meeting = meetingStore.createMeeting({ hostId: payload.hostId });
  return res.status(201).json({ meetingId: meeting.meetingId });
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

module.exports = router;
