const db = require('../../database/db/postgres');

function normalizeScope(scope) {
  return String(scope || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function buildStateId(scope) {
  const safe = normalizeScope(scope);
  return safe ? `erp_state:${safe}` : 'erp_state:default';
}

const TABLE_MAP = {
  admissions: 'admissions',
  students: 'students',
  courses: 'courses',
  attendance: 'attendance_summary',
  exams: 'exams',
  faculty: 'faculty',
  fees: 'fees',
  hr: 'hr',
  library: 'library',
  hostel: 'hostel',
  transport: 'transport',
  placements: 'placements',
  research: 'research',
  facilities: 'facilities',
  inventory: 'inventory',
  procurement: 'procurement',
  service: 'service_requests',
  communications: 'communications',
  compliance: 'compliance',
  departments: 'departments',
  assignments: 'assignments',
  marks: 'marks',
  leaveRequests: 'leave_requests',
  announcements: 'announcements',
  calendar: 'calendar_events',
  auditLogs: 'audit_logs',
  proposals: 'proposals',
  materials: 'materials',
  timetable: 'timetable'
};

function mapFeesRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    student: row.student || row.student_name || '',
    type: row.type || row.month || '',
    amount: row.amount != null ? Number(row.amount) : 0,
    due: row.due || row.due_date || null,
    mode: row.mode || '',
    status: row.status || ''
  };
}

function mapStudentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    roll: row.roll || row.class || '',
    dept: row.dept || '',
    year: row.year || '',
    status: row.status || '',
    email: row.email || '',
    phone: row.phone || '',
    cgpa: row.cgpa != null ? Number(row.cgpa) : row.cgpa,
    attendance: row.attendance != null ? Number(row.attendance) : row.attendance
  };
}

function mapMarksRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    course: row.subject || row.subject_id || '',
    exam: row.exam || '',
    student: row.student_name || row.student_id || '',
    roll: row.student_id || '',
    marks: row.marks != null ? Number(row.marks) : row.marks,
    maxMarks: row.max_marks != null ? Number(row.max_marks) : row.max_marks,
    grade: row.grade || ''
  };
}

function mapAttendanceRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    cls: row.cls || '',
    course: row.course || '',
    date: row.date || '',
    present: row.present != null ? Number(row.present) : row.present,
    total: row.total != null ? Number(row.total) : row.total,
    pct: row.pct != null ? Number(row.pct) : row.pct
  };
}

function mapFacultyRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    dept: row.dept || '',
    desig: row.desig || row.role || '',
    load: row.load != null ? Number(row.load) : row.load,
    email: row.email || '',
    status: row.status || '',
    leaveBalance: row.leave_balance != null ? Number(row.leave_balance) : row.leave_balance,
    courses: Array.isArray(row.courses) ? row.courses : row.courses || []
  };
}

function mapLeaveRequestRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    faculty: row.faculty || '',
    dept: row.dept || '',
    from: row.from_date || row.from || '',
    to: row.to_date || row.to || '',
    days: row.days != null ? Number(row.days) : row.days,
    reason: row.reason || '',
    status: row.status || '',
    appliedOn: row.applied_on || row.appliedOn || ''
  };
}

function mapAuditRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    user: row.user_name || row.user || '',
    action: row.action || '',
    target: row.target || '',
    timestamp: row.timestamp || '',
    ip: row.ip || ''
  };
}

async function listTableRows(tableName) {
  const rows = await db.getTableRows(tableName);
  return Array.isArray(rows) ? rows : [];
}

async function getUsersFromStore() {
  const store = await db.getAppState('users_store');
  const users = store && Array.isArray(store.users) ? store.users : [];
  return users.map((user) => {
    if (!user || typeof user !== 'object') return user;
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  });
}

async function getErpState(scope) {
  const state = {};
  const entries = Object.entries(TABLE_MAP);
  for (const [key, table] of entries) {
    const rows = await listTableRows(table);
    if (key === 'students') state[key] = rows.map(mapStudentRow).filter(Boolean);
    else if (key === 'fees') state[key] = rows.map(mapFeesRow).filter(Boolean);
    else if (key === 'marks') state[key] = rows.map(mapMarksRow).filter(Boolean);
    else if (key === 'attendance') state[key] = rows.map(mapAttendanceRow).filter(Boolean);
    else if (key === 'faculty') state[key] = rows.map(mapFacultyRow).filter(Boolean);
    else if (key === 'leaveRequests') state[key] = rows.map(mapLeaveRequestRow).filter(Boolean);
    else if (key === 'auditLogs') state[key] = rows.map(mapAuditRow).filter(Boolean);
    else state[key] = rows;
  }

  const store = await db.getAppState('users_store');
  state.users = await getUsersFromStore();
  if (store && Array.isArray(store.auditLogs)) {
    state.auditLogs = store.auditLogs;
  }

  return state;
}

async function setErpState(scope, state) {
  if (!state || typeof state !== 'object') return null;
  const entries = Object.entries(TABLE_MAP);
  for (const [key, table] of entries) {
    if (!Array.isArray(state[key])) continue;
    const mapped = state[key].map((row) => {
      if (!row || typeof row !== 'object') return null;
      if (key === 'students') {
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          roll: row.roll,
          class: row.class || row.cls,
          dept: row.dept,
          year: row.year,
          cgpa: row.cgpa,
          phone: row.phone,
          fees_due: row.fees_due || row.feesDue,
          attendance: row.attendance,
          status: row.status,
          created_at: row.created_at || row.createdAt
        };
      }
      if (key === 'fees') {
        return {
          id: row.id,
          student: row.student,
          type: row.type,
          amount: row.amount,
          due: row.due,
          mode: row.mode,
          status: row.status,
          student_id: row.student_id,
          student_name: row.student_name
        };
      }
      if (key === 'marks') {
        return {
          id: row.id,
          student_id: row.student_id || row.studentId || null,
          subject_id: row.subject_id || row.subjectId || row.course || null,
          subject: row.subject || row.course || '',
          marks: row.marks,
          max_marks: row.max_marks || row.maxMarks,
          grade: row.grade,
          exam: row.exam
        };
      }
      if (key === 'attendance') {
        return {
          id: row.id,
          cls: row.cls || row.class,
          course: row.course,
          date: row.date,
          present: row.present,
          total: row.total,
          pct: row.pct
        };
      }
      if (key === 'faculty') {
        return {
          id: row.id,
          name: row.name,
          dept: row.dept,
          desig: row.desig || row.role,
          load: row.load,
          email: row.email,
          status: row.status,
          leave_balance: row.leave_balance || row.leaveBalance,
          courses: row.courses || []
        };
      }
      if (key === 'leaveRequests') {
        return {
          id: row.id,
          faculty: row.faculty,
          dept: row.dept,
          from_date: row.from_date || row.from,
          to_date: row.to_date || row.to,
          days: row.days,
          reason: row.reason,
          status: row.status,
          applied_on: row.applied_on || row.appliedOn
        };
      }
      if (key === 'auditLogs') {
        return {
          id: row.id,
          user_name: row.user_name || row.user,
          action: row.action,
          target: row.target,
          timestamp: row.timestamp,
          ip: row.ip
        };
      }
      return row;
    }).filter(Boolean);
    await db.replaceTableRows(table, mapped);
  }
  if (Array.isArray(state.auditLogs)) {
    const store = (await db.getAppState('users_store')) || {};
    const next = Object.assign({}, store, { auditLogs: state.auditLogs });
    await db.setAppState('users_store', next);
  }
  return state;
}

module.exports = {
  getErpState,
  setErpState,
  clearErpState: async () => {
    const entries = Object.values(TABLE_MAP);
    for (const table of entries) {
      await db.replaceTableRows(table, []);
    }
    return true;
  }
};
