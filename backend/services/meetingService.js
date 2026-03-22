const db = require('../../database/db/postgres');

async function createMeetingRecord(payload) {
  const data = payload || {};
  const meetingId = String(data.meetingId || '').trim();
  if (!meetingId) return null;
  const title = data.title || null;
  const description = data.description || null;
  const scheduledTime = data.scheduledAt || data.scheduledTime || null;
  const createdBy = data.createdBy ? Number(data.createdBy) : null;
  const createdByRef = data.createdByRef || data.hostId || null;

  await db.query(
    `INSERT INTO meetings (meeting_id, title, description, scheduled_time, created_by, created_by_ref)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (meeting_id)
     DO UPDATE SET title = COALESCE(EXCLUDED.title, meetings.title),
                   description = COALESCE(EXCLUDED.description, meetings.description),
                   scheduled_time = COALESCE(EXCLUDED.scheduled_time, meetings.scheduled_time),
                   created_by = COALESCE(EXCLUDED.created_by, meetings.created_by),
                   created_by_ref = COALESCE(EXCLUDED.created_by_ref, meetings.created_by_ref)`,
    [
      meetingId,
      title,
      description,
      scheduledTime,
      createdBy,
      createdByRef
    ]
  );
  return { meetingId };
}

async function addInviteRecord(payload) {
  const data = payload || {};
  const meetingId = String(data.meetingId || '').trim();
  if (!meetingId) return null;
  await db.query(
    `INSERT INTO meeting_invites (meeting_id, invited_user_id, invited_user_ref, invited_by, invited_by_ref, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      meetingId,
      data.invitedUserId ? Number(data.invitedUserId) : null,
      data.invitedUserRef || data.invitedUserId || null,
      data.invitedById ? Number(data.invitedById) : null,
      data.invitedByRef || data.invitedBy || null,
      data.status || 'pending'
    ]
  );
  return { meetingId };
}

async function addParticipantRecord(payload) {
  const data = payload || {};
  const meetingId = String(data.meetingId || '').trim();
  if (!meetingId) return null;
  const studentId = data.studentId ? Number(data.studentId) : null;
  const userRef = data.userRef || data.userId || null;

  const check = await db.query(
    `SELECT id FROM meeting_participants WHERE meeting_id = $1 AND
     (student_id IS NOT DISTINCT FROM $2 OR user_ref = $3) LIMIT 1`,
    [meetingId, studentId, userRef]
  );
  if (check.rows && check.rows[0]) return check.rows[0];

  await db.query(
    `INSERT INTO meeting_participants (meeting_id, student_id, user_ref, role)
     VALUES ($1, $2, $3, $4)`,
    [meetingId, studentId, userRef, data.role || null]
  );
  return { meetingId };
}

async function markParticipantLeft(payload) {
  const data = payload || {};
  const meetingId = String(data.meetingId || '').trim();
  if (!meetingId) return null;
  const studentId = data.studentId ? Number(data.studentId) : null;
  const userRef = data.userRef || data.userId || null;
  await db.query(
    `UPDATE meeting_participants SET left_at = NOW()
     WHERE meeting_id = $1 AND (student_id IS NOT DISTINCT FROM $2 OR user_ref = $3) AND left_at IS NULL`,
    [meetingId, studentId, userRef]
  );
  return { meetingId };
}

module.exports = {
  createMeetingRecord,
  addInviteRecord,
  addParticipantRecord,
  markParticipantLeft
};
